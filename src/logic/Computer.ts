import Processor from './Processor';
import Graphics from './Graphics';
import Sound from './Sound';
import Memory from './Memory';
import { Storage, File, Directory, Program } from './Storage';
import biosUrl from '../assets/roms/bios.prg?url';
import snakeUrl from '../assets/games/snake.prg?url';
import tetrisUrl from '../assets/games/tetris.prg?url';

const resetVector = 0xfffc;

const registerFrameCounter = 0x0220;
const registerMinRandom = 0x0221;
const registerMaxRandom = 0x0222;
const registerRandomValue = 0x0223;

export enum Status {
    OFF,
    BREAKPOINT,
    RESET,
    ON
}

interface ComputerParams {
    memorySize?: number;
    monitorWidth?: number;
    monitorHeight?: number;
    updateCallback?: () => void;
    testMode?: boolean;
}

export class Computer {
    status: Status = Status.OFF;
    cpu: Processor;
    gfx?: Graphics;
    snd?: Sound;
    mem: Memory;
    stor?: Storage;
    domUpdateInstructionsInterval: number = 2_500; // adjust this for fps
    targetCyclesPerSec: number = 1_000_000;
    currentCyclesPerSec: number = 0;
    startTime: number = 0;
    targetFps: number = 60;
    currentFps: number = 0;
    frameCounter: number = 0;
    yieldCounter: number = 0;
    previousCycleCounter: number = 0;
    updateCallback: () => void;
    breakPoints: number[] = [];
    games: string[][];

    constructor({ memorySize = 65536, updateCallback = () => {}, testMode = false }: ComputerParams) {
        this.updateCallback = updateCallback;

        this.mem = new Memory(
            memorySize,
            index => {
                if (!this.gfx) return;
                this.gfx.checkMemWrite(index);
            },
            index => {
                if (!this.snd) return;
                this.snd.checkMemWrite(index);
            },
            index => {
                if (!this.stor) return;
                this.stor.checkMemWrite(index);
            }
        );

        if (!testMode) {
            this.gfx = new Graphics(this.mem);

            this.snd = new Sound(this.mem);

            this.stor = new Storage(this.mem);

            this.stor.fsObjects.push(
                new File(
                    null,
                    'lala',
                    this.stringToByteArray(
                        'lala\nlulu\nding dong\nDenn wo das Strenge mit dem Zarten\nWo Starkes sich und Mildes paarten\nDa gibt es einen guten Klang'
                    )
                )
            );
            this.stor.fsObjects.push(new File(null, 'lulu and the lootersXXXX', this.stringToByteArray('ding dong')));

            const tmpDir = new Directory(null, 'tmp');
            this.stor.fsObjects.push(tmpDir);

            const lowerDir = new Directory(tmpDir, 'lower');
            tmpDir.fsObjects.push(lowerDir);

            const lowestDir = new Directory(lowerDir, 'lowest');
            lowerDir.fsObjects.push(lowestDir);

            //this.stor.fsObjects.push(new Program(null, 'snake', 0x4000, this.stringToByteArray('010101010101')));
        }

        this.cpu = new Processor(this.mem);

        this.games = [];

        if (!testMode) {
            this.games = [
                ['snake', snakeUrl],
                ['tetris', tetrisUrl]
            ];

            this.addGamesToStorage();
        }
    }

    stringToByteArray(string: string) {
        let utf8Encode = new TextEncoder();
        return Array.from(utf8Encode.encode(string)); // Uint8Array to number[]
    }

    hardwareInterrupt(cycleCounter: number) {
        let value = false;
        if (cycleCounter % (this.targetCyclesPerSec / this.targetFps) < 8 && cycleCounter - this.previousCycleCounter > 8) {
            value = true;
            this.previousCycleCounter = cycleCounter;
        }
        return value;
    }

    executeNextInstruction() {
        this.updateDatetimeRegisters();
        this.cpu.processInstruction();
    }

    async loadBios() {
        let biosInt = new Uint8Array(await (await fetch(biosUrl)).arrayBuffer());

        const loadAddress = (biosInt[1] << 8) | biosInt[0];

        biosInt = biosInt.subarray(2);

        biosInt.forEach((int, index) => {
            this.mem.int[loadAddress + index] = int;
        });
    }

    async addGamesToStorage() {
        if (!this.stor) return;

        const gamesDir = new Directory(null, 'games');
        this.stor.fsObjects.push(gamesDir);

        this.games.forEach(async game => {
            let uInt8Array = new Uint8Array(await (await fetch(game[1])).arrayBuffer());

            const loadAddress = (uInt8Array[1] << 8) | uInt8Array[0];

            uInt8Array = uInt8Array.subarray(2);

            // convert Uint8Array to number[]
            const gameInt = Array.from(uInt8Array);

            gamesDir.fsObjects.push(new Program(gamesDir, game[0], loadAddress, gameInt));
        });
    }

    async turnOn() {
        if (this.status === Status.ON) return;

        if (this.gfx) this.gfx.clearCanvasBackground();

        await this.loadBios();

        this.cpu.pc.setInt(this.mem.int[resetVector], this.mem.int[resetVector + 1]);

        this.play();
    }

    play() {
        this.status = Status.ON;

        this.startTime = Date.now();

        this.yieldCounter = 0;
        this.previousCycleCounter = 0;

        const stopCondition = () => this.status === Status.OFF || this.status === Status.RESET || this.status === Status.BREAKPOINT;
        const yieldCondition = () => this.cpu.instructionCounter % this.domUpdateInstructionsInterval === 0;

        const loop = (): void => {
            if (this.breakPoints.includes(this.cpu.pc.int)) {
                this.status = Status.BREAKPOINT;
                this.updateCallback();
                return;
            }

            if (this.cpu.brkReached) {
                this.status = Status.BREAKPOINT;
                this.updateCallback();
                this.cpu.brkReached = false;
                return;
            }

            this.executeNextInstruction();

            this.updateFrameCounter();

            this.updateRandomValue();

            if (this.hardwareInterrupt(this.cpu.cycleCounter) && !this.cpu.p.getInterruptFlag()) {
                this.cpu.irq(); // timer based interrupt
                this.cpu.cycleCounter = this.cpu.cycleCounter + 7;
            }

            // Update DOM if we're about to yield
            if (yieldCondition()) {
                this.yieldCounter++;

                const now = Date.now();

                this.currentCyclesPerSec = (this.cpu.cycleCounter * 1000) / (now - this.startTime);

                this.currentFps = (this.yieldCounter * 1000) / (now - this.startTime);

                this.updateCallback();
            }

            // Update DOM if we're about to stop
            if (stopCondition()) {
                this.updateCallback();

                if (this.status === Status.OFF) this.resetComponents();
                if (this.status === Status.RESET) this.turnOn();
            }
        };

        this.doUntil(loop, stopCondition, yieldCondition);
    }

    turnOff() {
        if (this.status === Status.BREAKPOINT) {
            this.resetComponents();
        }
        this.status = Status.OFF;
    }

    private resetComponents() {
        this.currentCyclesPerSec = 0;
        this.currentFps = 0;
        this.breakPoints = [];
        this.cpu.reset();
        this.mem.reset();
        if (this.gfx) this.gfx.reset();
    }

    reset() {
        this.status = Status.RESET;
    }

    doUntil(loop: () => void, stopCondition: () => boolean, yieldCondition: () => boolean): Promise<void> {
        // Wrap function in promise so it can run asynchronously
        return new Promise((resolve, _reject) => {
            // Build outerLoop function to pass to setTimeout
            let outerLoop = function () {
                while (true) {
                    // Execute a single inner loop iteration
                    loop();

                    if (stopCondition()) {
                        // Resolve promise, exit outer loop,
                        // and do not re-enter
                        resolve();
                        break;
                    } else if (yieldCondition()) {
                        // Exit outer loop and queue up next
                        // outer loop iteration for next event loop cycle
                        setTimeout(outerLoop, 0);
                        break;
                    }

                    // Continue to next inner loop iteration
                    // without yielding
                }
            };

            // Start the first iteration of outer loop,
            // unless the stop condition is met
            if (!stopCondition()) {
                setTimeout(outerLoop, 0);
            }
        });
    }

    private updateFrameCounter() {
        if (
            this.cpu.cycleCounter % (this.targetCyclesPerSec / this.targetFps) < 8 &&
            this.cpu.cycleCounter - this.previousCycleCounter > 8
        ) {
            this.frameCounter++;
            this.frameCounter = this.frameCounter % this.targetFps;

            this.mem.setInt(registerFrameCounter, this.frameCounter);
        }
    }

    private updateRandomValue() {
        const min = this.mem.int[registerMinRandom];
        const max = this.mem.int[registerMaxRandom] + 1;
        const randomValue = Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
        this.mem.setInt(registerRandomValue, randomValue);
    }

    public toggleBreakpoint(value: number) {
        if (this.breakPoints.includes(value)) {
            const index = this.breakPoints.indexOf(value);
            this.breakPoints.splice(index, 1);
        } else {
            this.breakPoints.push(value);
        }
    }

    public updateDatetimeRegisters() {
        const date = new Date();
        this.mem.setInt(0x020c, date.getFullYear() & 0x00ff);
        this.mem.setInt(0x020d, (date.getFullYear() & 0xff00) >> 8);
        this.mem.setInt(0x020e, (date.getDay() << 4) | date.getMonth());
        this.mem.setInt(0x020f, date.getDate());
        this.mem.setInt(0x0210, date.getHours());
        this.mem.setInt(0x0211, date.getMinutes());
        this.mem.setInt(0x0212, date.getSeconds());
        const now = Date.now();
        const diff = now - this.startTime;
        this.mem.setInt(0x0213, diff & 0x000000ff);
        this.mem.setInt(0x0214, (diff & 0x0000ff00) >> 8);
        this.mem.setInt(0x0215, (diff & 0x00ff0000) >> 16);
        this.mem.setInt(0x0216, (diff & 0xff000000) >> 24);
    }

    // Reference https://w3c.github.io/uievents-code/

    public keyEvent(eventType: string, keyName: string) {
        let address: string | undefined = undefined;
        let bitIndex: number | undefined = undefined;

        switch (keyName) {
            case 'KeyA':
                address = '0200';
                bitIndex = 0;
                break;
            case 'KeyB':
                address = '0200';
                bitIndex = 1;
                break;
            case 'KeyC':
                address = '0200';
                bitIndex = 2;
                break;
            case 'KeyD':
                address = '0200';
                bitIndex = 3;
                break;
            case 'KeyE':
                address = '0200';
                bitIndex = 4;
                break;
            case 'KeyF':
                address = '0200';
                bitIndex = 5;
                break;
            case 'KeyG':
                address = '0200';
                bitIndex = 6;
                break;
            case 'KeyH':
                address = '0200';
                bitIndex = 7;
                break;
            case 'KeyI':
                address = '0201';
                bitIndex = 0;
                break;
            case 'KeyJ':
                address = '0201';
                bitIndex = 1;
                break;
            case 'KeyK':
                address = '0201';
                bitIndex = 2;
                break;
            case 'KeyL':
                address = '0201';
                bitIndex = 3;
                break;
            case 'KeyM':
                address = '0201';
                bitIndex = 4;
                break;
            case 'KeyN':
                address = '0201';
                bitIndex = 5;
                break;
            case 'KeyO':
                address = '0201';
                bitIndex = 6;
                break;
            case 'KeyP':
                address = '0201';
                bitIndex = 7;
                break;
            case 'KeyQ':
                address = '0202';
                bitIndex = 0;
                break;
            case 'KeyR':
                address = '0202';
                bitIndex = 1;
                break;
            case 'KeyS':
                address = '0202';
                bitIndex = 2;
                break;
            case 'KeyT':
                address = '0202';
                bitIndex = 3;
                break;
            case 'KeyU':
                address = '0202';
                bitIndex = 4;
                break;
            case 'KeyV':
                address = '0202';
                bitIndex = 5;
                break;
            case 'KeyW':
                address = '0202';
                bitIndex = 6;
                break;
            case 'KeyX':
                address = '0202';
                bitIndex = 7;
                break;
            case 'KeyY':
                address = '0203';
                bitIndex = 0;
                break;
            case 'KeyZ':
                address = '0203';
                bitIndex = 1;
                break;
            case 'Digit1':
                address = '0203';
                bitIndex = 2;
                break;
            case 'Digit2':
                address = '0203';
                bitIndex = 3;
                break;
            case 'Digit3':
                address = '0203';
                bitIndex = 4;
                break;
            case 'Digit4':
                address = '0203';
                bitIndex = 5;
                break;
            case 'Digit5':
                address = '0203';
                bitIndex = 6;
                break;
            case 'Digit6':
                address = '0203';
                bitIndex = 7;
                break;
            case 'Digit7':
                address = '0204';
                bitIndex = 0;
                break;
            case 'Digit8':
                address = '0204';
                bitIndex = 1;
                break;
            case 'Digit9':
                address = '0204';
                bitIndex = 2;
                break;
            case 'Digit0':
                address = '0204';
                bitIndex = 3;
                break;
            case 'Minus':
                address = '0204';
                bitIndex = 4;
                break;
            case 'Equal':
                address = '0204';
                bitIndex = 5;
                break;
            case 'Comma':
                address = '0204';
                bitIndex = 6;
                break;
            case 'Period':
                address = '0204';
                bitIndex = 7;
                break;
            case 'ArrowLeft':
                address = '0205';
                bitIndex = 0;
                break;
            case 'ArrowRight':
                address = '0205';
                bitIndex = 1;
                break;
            case 'ArrowUp':
                address = '0205';
                bitIndex = 2;
                break;
            case 'ArrowDown':
                address = '0205';
                bitIndex = 3;
                break;
            case 'Enter':
                address = '0205';
                bitIndex = 4;
                break;
            case 'Backspace':
                address = '0205';
                bitIndex = 5;
                break;
            case 'Escape':
                address = '0205';
                bitIndex = 6;
                break;
            case 'Backslash':
                address = '0205';
                bitIndex = 7;
                break;
            case 'F1':
                address = '0206';
                bitIndex = 0;
                break;
            case 'F2':
                address = '0206';
                bitIndex = 1;
                break;
            case 'F3':
                address = '0206';
                bitIndex = 2;
                break;
            case 'F4':
                address = '0206';
                bitIndex = 3;
                break;
            case 'F5':
                address = '0206';
                bitIndex = 4;
                break;
            case 'F6':
                address = '0206';
                bitIndex = 5;
                break;
            case 'F7':
                address = '0206';
                bitIndex = 6;
                break;
            case 'F8':
                address = '0206';
                bitIndex = 7;
                break;
            case 'F9':
                address = '0207';
                bitIndex = 0;
                break;
            case 'F10':
                address = '0207';
                bitIndex = 1;
                break;
            case 'Semicolon':
                address = '0207';
                bitIndex = 2;
                break;
            case 'Quote':
                address = '0207';
                bitIndex = 3;
                break;
            case 'BracketLeft':
                address = '0207';
                bitIndex = 4;
                break;
            case 'BracketRight':
                address = '0207';
                bitIndex = 5;
                break;
            case 'Backquote':
                address = '0207';
                bitIndex = 6;
                break;
            case 'IntlBackslash':
                address = '0207';
                bitIndex = 7;
                break;
            case 'PageUp':
                address = '0208';
                bitIndex = 0;
                break;
            case 'PageDown':
                address = '0208';
                bitIndex = 1;
                break;
            case 'Home':
                address = '0208';
                bitIndex = 2;
                break;
            case 'End':
                address = '0208';
                bitIndex = 3;
                break;
            case 'Insert':
                address = '0208';
                bitIndex = 4;
                break;
            case 'Delete':
                address = '0208';
                bitIndex = 5;
                break;
            case 'PrintScreen':
                address = '0208';
                bitIndex = 6;
                break;
            case 'Slash':
                address = '0208';
                bitIndex = 7;
                break;
            case 'Tab':
                address = '0209';
                bitIndex = 0;
                break;
            case 'CapsLock':
                address = '0209';
                bitIndex = 1;
                break;
            case 'Space':
                address = '0209';
                bitIndex = 2;
                break;
            case 'XXX':
                address = '0209';
                bitIndex = 3;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                address = '0209';
                bitIndex = 4;
                break;
            case 'ControlLeft':
            case 'ControlRight':
                address = '0209';
                bitIndex = 5;
                break;
            case 'AltLeft':
            case 'AltRight':
                address = '0209';
                bitIndex = 6;
                break;
            case 'MetaLeft':
            case 'MetaRight':
                address = '0209';
                bitIndex = 7;
                break;
            default: {
                break;
            }
        }

        //console.log(`address: ${address} bitIndex: ${bitIndex} eventType: ${eventType}`);

        if (address !== undefined && bitIndex !== undefined && this.status === Status.ON) {
            const newValue = eventType === 'down' ? true : false; // set or reset bit
            this.mem.setBitByIndex(parseInt(address, 16), bitIndex, newValue);
        }
    }
}
