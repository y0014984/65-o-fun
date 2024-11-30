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
