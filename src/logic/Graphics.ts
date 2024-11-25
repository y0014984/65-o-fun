import Font from './Font';
import Memory from './Memory';

export default class Graphics {
    private width: number;
    private height: number;
    private ctx: CanvasRenderingContext2D | null;
    private mem: Memory;
    private font: Font = new Font();

    constructor(width: number = 320, height: number = 240, ctx: CanvasRenderingContext2D | null, mem: Memory) {
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.mem = mem;
    }

    setCtx(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    checkMemWrite(index: number) {
        if (index) console.log(this.mem.getInt(index));
    }

    drawBackground() {
        if (!this.ctx) return;

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawLetter(x: number, y: number, letterCode: string) {
        if (!this.ctx) return;

        const imgData = this.ctx.createImageData(8, 8);

        const letter = this.font.table.find(element => element.letterCode === letterCode)!;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (letter.letterBitmap[i][j] === 1) {
                    imgData.data[(i * 8 + j) * 4 + 0] = 255; // Reg
                    imgData.data[(i * 8 + j) * 4 + 1] = 255; // Green
                    imgData.data[(i * 8 + j) * 4 + 2] = 255; // Blue
                    imgData.data[(i * 8 + j) * 4 + 3] = 255; // Alpha
                } else {
                    imgData.data[(i * 8 + j) * 4 + 0] = 0; // Reg
                    imgData.data[(i * 8 + j) * 4 + 1] = 0; // Green
                    imgData.data[(i * 8 + j) * 4 + 2] = 0; // Blue
                    imgData.data[(i * 8 + j) * 4 + 3] = 255; // Alpha
                }
            }
        }

        this.ctx.putImageData(imgData, x * 8, y * 8);
    }
}
