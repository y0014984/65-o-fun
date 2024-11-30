import Graphics from './Graphics';
import Memory from './Memory';
import Processor from './Processor';

export default class Computer {
    gfx: Graphics;
    mem: Memory;
    cpu: Processor;

    constructor({
        memorySize = 65536,
        monitorWidth = 320,
        monitorHeight = 240,
        ctx = null
    }: {
        memorySize?: number;
        monitorWidth?: number;
        monitorHeight?: number;
        ctx: CanvasRenderingContext2D | null;
    }) {
        this.mem = new Memory(memorySize, index => {
            this.gfx.checkMemWrite(index);
        });

        this.gfx = new Graphics(monitorWidth, monitorHeight, ctx, this.mem);

        this.cpu = new Processor(this.mem);
    }

    public keyEvent(eventType: string, keyName: string, keyValue: string) {
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
            default: {
                break;
            }
        }

        /*         let integer = this.mem.getInt(parseInt(address, 16)); // read byte from mem
        const mask = 1 << bitIndex; // gets the xth bit
        eventType === 'down' ? (integer |= mask) : (integer &= ~mask); // set or reset bit
        this.mem.setInt(parseInt(address, 16), integer); // store byte to mem */

        if (address !== undefined && bitIndex !== undefined) {
            const newValue = eventType === 'down' ? true : false; // set or reset bit
            this.mem.getByte(parseInt(address, 16)).setBitByIndex(bitIndex, newValue);
        } else {
            console.log(`address: ${address} index: ${bitIndex}`);
        }
    }
}
