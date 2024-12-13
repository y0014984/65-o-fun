import Graphics from './Graphics';
import Memory from './Memory';
import Processor from './Processor';

export enum Status {
    ON,
    HALT,
    OFF
}

export class Computer {
    status: Status;
    gfx: Graphics;
    mem: Memory;
    cpu: Processor;

    domUpdateInstructionsInterval: number = 2_500; // adjust this for fps

    targetCyclesPerSec: number = 1_000_000;
    currentCyclesPerSec: number = 0;

    startTime: number = 0;

    targetFps: number = 60;
    currentFps: number = 0;

    yieldCounter: number = 0;

    previousCycleCounter: number = 0;

    constructor({
        memorySize = 65536,
        monitorWidth = 320,
        monitorHeight = 240
    }: {
        memorySize?: number;
        monitorWidth?: number;
        monitorHeight?: number;
    }) {
        this.status = Status.OFF;

        this.mem = new Memory(memorySize, index => {
            index;
            if (this.gfx) {
                this.gfx.checkMemWrite(index);
            }
        });

        this.gfx = new Graphics(monitorWidth, monitorHeight, this.mem);

        const irqCallback = (cycleCounter: number) => {
            let value = false;
            if (cycleCounter % (this.targetCyclesPerSec / this.targetFps) < 8 && cycleCounter - this.previousCycleCounter > 8) {
                value = true;
                this.previousCycleCounter = cycleCounter;
            }
            return value;
        };

        const brkCallback = () => {
            console.log('BRK CALLBACK');
            this.status = Status.OFF;
        };

        this.cpu = new Processor(this.mem, irqCallback, brkCallback);
    }

    turnOn() {
        if (this.status === Status.ON) return;

        this.startTime = Date.now();

        const stopCondition = () => (this.cpu.instructionCounter > 0 && this.cpu.ir.int === 0) || this.status === Status.OFF;
        const yieldCondition = () => this.cpu.instructionCounter % this.domUpdateInstructionsInterval === 0;

        const loop = (): void => {
            this.cpu.processInstruction();

            if (this.cpu.irqCallback(this.cpu.cycleCounter) && !this.cpu.p.getInterruptFlag()) {
                this.cpu.irq(); // timer based interrupt
                this.cpu.cycleCounter = this.cpu.cycleCounter + 7;
                //this.stopProcessor();
            }

            // Update DOM if we're about to yield
            if (yieldCondition()) {
                this.yieldCounter++;

                const now = Date.now();

                this.currentCyclesPerSec = (this.cpu.cycleCounter * 1000) / (now - this.startTime);

                this.currentFps = (this.yieldCounter * 1000) / (now - this.startTime);
            }

            // Update DOM if we're about to stop
            if (stopCondition()) {
                // Do whatever you want
            }
        };

        this.status = Status.ON;

        this.doUntil(loop, stopCondition, yieldCondition);
    }

    turnOff() {
        if (!(this.status === Status.ON || this.status === Status.HALT)) return;

        this.status = Status.OFF;
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
            case 'ShiftLeft':
            case 'ShiftRight':
                address = '0205';
                bitIndex = 0;
                break;
            case 'Control':
                address = '0205';
                bitIndex = 1;
                break;
            case 'Alt':
                address = '0205';
                bitIndex = 2;
                break;
            case 'Meta':
                address = '0205';
                bitIndex = 3;
                break;
            case 'Tab':
                address = '0205';
                bitIndex = 4;
                break;
            case 'CapsLock':
                address = '0205';
                bitIndex = 5;
                break;
            case 'Space':
                address = '0205';
                bitIndex = 6;
                break;
            case 'Slash':
                address = '0205';
                bitIndex = 7;
                break;
            case 'ArrowLeft':
                address = '0206';
                bitIndex = 0;
                break;
            case 'ArrowRight':
                address = '0206';
                bitIndex = 1;
                break;
            case 'ArrowUp':
                address = '0206';
                bitIndex = 2;
                break;
            case 'ArrowDown':
                address = '0206';
                bitIndex = 3;
                break;
            case 'Enter':
                address = '0206';
                bitIndex = 4;
                break;
            case 'Backspace':
                address = '0206';
                bitIndex = 5;
                break;
            case 'Escape':
                address = '0206';
                bitIndex = 6;
                break;
            case 'Backslash':
                address = '0206';
                bitIndex = 7;
                break;
            case 'F1':
                address = '0207';
                bitIndex = 0;
                break;
            case 'F2':
                address = '0207';
                bitIndex = 1;
                break;
            case 'F3':
                address = '0207';
                bitIndex = 2;
                break;
            case 'F4':
                address = '0207';
                bitIndex = 3;
                break;
            case 'F5':
                address = '0207';
                bitIndex = 4;
                break;
            case 'F6':
                address = '0207';
                bitIndex = 5;
                break;
            case 'F7':
                address = '0207';
                bitIndex = 6;
                break;
            case 'F8':
                address = '0207';
                bitIndex = 7;
                break;
            case 'F9':
                address = '0208';
                bitIndex = 0;
                break;
            case 'F10':
                address = '0208';
                bitIndex = 1;
                break;
            case 'Semicolon':
                address = '0208';
                bitIndex = 2;
                break;
            case 'Quote':
                address = '0208';
                bitIndex = 3;
                break;
            case 'BracketLeft':
                address = '0208';
                bitIndex = 4;
                break;
            case 'BracketRight':
                address = '0208';
                bitIndex = 5;
                break;
            case 'Backquote':
                address = '0208';
                bitIndex = 6;
                break;
            case 'IntlBackslash':
                address = '0208';
                bitIndex = 7;
                break;
            case 'PageUp':
                address = '0209';
                bitIndex = 0;
                break;
            case 'PageDown':
                address = '0209';
                bitIndex = 1;
                break;
            case 'Home':
                address = '0209';
                bitIndex = 2;
                break;
            case 'End':
                address = '0209';
                bitIndex = 3;
                break;
            case 'Insert':
                address = '0209';
                bitIndex = 4;
                break;
            case 'Delete':
                address = '0209';
                bitIndex = 5;
                break;
            case 'PrintScreen':
                address = '0209';
                bitIndex = 6;
                break;
            case 'XXX':
                address = '0209';
                bitIndex = 7;
                break;
            default: {
                break;
            }
        }

        if (address !== undefined && bitIndex !== undefined) {
            const newValue = eventType === 'down' ? true : false; // set or reset bit
            this.mem.setBitByIndex(parseInt(address, 16), bitIndex, newValue);
        }
    }
}
