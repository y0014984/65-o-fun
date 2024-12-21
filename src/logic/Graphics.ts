import Font from './Font';
import Memory from './Memory';

interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

export default class Graphics {
    private width: number;
    private height: number;
    private ctx?: CanvasRenderingContext2D;
    private mem: Memory;
    private font: Font = new Font();
    private fgCol: Color = { r: 255, g: 255, b: 255, a: 255 };
    private bgCol: Color = { r: 0, g: 0, b: 0, a: 255 };

    constructor(width: number = 320, height: number = 240, mem: Memory) {
        this.width = width;
        this.height = height;
        this.mem = mem;

        this.initRegisters();
    }

    initRegisters() {
        this.mem.setInt(0x020a, 0b11111111); // Foreground Color White
        this.mem.setInt(0x020b, 0b00000011); // Background Color Black

        this.memToCol(0x020a, this.fgCol);
        this.memToCol(0x020b, this.bgCol);
    }

    reset() {
        if (this.ctx) this.drawBackground();
        this.initRegisters();
    }

    setCtx(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    checkMemWrite(index: number) {
        // check writing to screen ram
        const screenRam = 256 * 4;
        if (index >= screenRam && index <= screenRam + this.width * this.height) {
            const tmpIndex = index - screenRam;
            const x = tmpIndex % (this.width / 8);
            const y = Math.floor(tmpIndex / (this.width / 8));
            this.drawLetter(x, y, this.mem.getAsHexString(index));
        }

        // check writing to foreground color register
        if (index === 0x020a) {
            this.memToCol(index, this.fgCol);
        }

        // check writing to background color register
        if (index === 0x020b) {
            this.memToCol(index, this.bgCol);
        }
    }

    memToCol(index: number, color: Color) {
        const memory = this.mem.int[index];
        color.r = ((memory & 0b11000000) >> 6) * 85;
        color.g = ((memory & 0b00110000) >> 4) * 85;
        color.b = ((memory & 0b00001100) >> 2) * 85;
        color.a = (memory & 0b00000011) * 85;
    }

    drawBackground() {
        if (!this.ctx) return;

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawLetter(x: number, y: number, letterCode: string) {
        if (!this.ctx) return;

        const imgData = this.ctx.createImageData(8, 8);

        const letter = this.font.table.find(element => element.letterCode === letterCode);

        if (!letter) return;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (letter.letterBitmap[i][j] === 1) {
                    imgData.data[(i * 8 + j) * 4 + 0] = this.fgCol.r; // Red
                    imgData.data[(i * 8 + j) * 4 + 1] = this.fgCol.g; // Green
                    imgData.data[(i * 8 + j) * 4 + 2] = this.fgCol.b; // Blue
                    imgData.data[(i * 8 + j) * 4 + 3] = this.fgCol.a; // Alpha
                } else {
                    imgData.data[(i * 8 + j) * 4 + 0] = this.bgCol.r; // Red
                    imgData.data[(i * 8 + j) * 4 + 1] = this.bgCol.g; // Green
                    imgData.data[(i * 8 + j) * 4 + 2] = this.bgCol.b; // Blue
                    imgData.data[(i * 8 + j) * 4 + 3] = this.bgCol.a; // Alpha
                }
            }
        }

        this.ctx.putImageData(imgData, x * 8, y * 8);
    }
}
