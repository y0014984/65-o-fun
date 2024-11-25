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
}
