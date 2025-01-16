import Memory from './Memory';

// ================================================================================

const registerColorMode = 0x0227;
const registerColorTableAddress = 0x0228; // Word
const registerTileModeOrientation = 0x022a;
const registerTileMapWidth = 0x022b;
const registerTileMapHeight = 0x022c;
const registerTileMapAddress = 0x022d; // Word
const registerTileSetAddress = 0x022f; // Word
const registerTileSetLength = 0x0231;

// ================================================================================

export enum ColorMode {
    INVISIBLE,
    COL2, // 1 bit color code
    COL4, // 2 bits color code
    COL8, // 3 bits color code
    COL16,
    COL32,
    COL64,
    COL128
}

export enum TileMode {
    TIL1,
    TIL2,
    TIL4,
    TIL8,
    TIL16,
    TIL32,
    TIL64,
    TIL128
}

export enum TileOrientation {
    LEFT_RIGHT,
    TOP_BOTTOM
}

// ================================================================================

export default class Graphics {
    private mem: Memory;
    private ctx?: CanvasRenderingContext2D;

    private colorMode: ColorMode;
    private colorTableAddress: number;
    private tileMode: TileMode;
    private tileOrientation: TileOrientation;
    private tileMapWidth: number;
    private tileWidth: number;
    private tileHeight: number;
    private tileSize: number;
    private tileMapHeight: number;
    private tileMapAddress: number;
    private tileMapLength: number;
    private tileSetAddress: number;
    private tileSetLength: number;

    private screenWidth: number;
    private screenHeight: number;

    private tileSet: Tile[];
    private colorTable: Color[];

    // ----------------------------------------

    constructor(mem: Memory) {
        this.mem = mem;

        this.colorMode = this.mem.int[registerColorMode] & 0b00000111; // only lower 3 bits
        this.colorTableAddress = (this.mem.int[registerColorTableAddress + 1] << 8) | this.mem.int[registerColorTableAddress];
        this.tileMode = this.mem.int[registerTileModeOrientation] & 0b00000111; // only lower 3 bits
        this.tileOrientation = this.mem.int[registerTileModeOrientation] & 0b00001000; // only 4th bit
        this.tileMapWidth = this.mem.int[registerTileMapWidth];
        this.tileMapHeight = this.mem.int[registerTileMapHeight];
        this.tileMapAddress = (this.mem.int[registerTileMapAddress + 1] << 8) | this.mem.int[registerTileMapAddress];
        this.tileSetAddress = (this.mem.int[registerTileSetAddress + 1] << 8) | this.mem.int[registerTileSetAddress];
        this.tileSetLength = this.mem.int[registerTileSetLength];

        const value = Math.pow(2, this.tileMode);
        this.tileWidth = value;
        this.tileHeight = value;
        this.tileSize = (this.tileWidth * this.tileHeight * this.colorMode) / 8; // number of bytes per tile
        this.screenWidth = this.tileMapWidth * value;
        this.screenHeight = this.tileMapHeight * value;

        this.tileMapLength = this.tileMapWidth * this.tileMapHeight;

        this.tileSet = [];
        this.colorTable = [];

        this.loadTileSetFromMem();
        this.loadColorTableFromMem();

        this.drawScreen();
    }

    // ----------------------------------------

    reset() {
        console.log('reset');

        this.colorMode = ColorMode.INVISIBLE;
        this.colorTableAddress = 0x0000;
        this.tileMode = TileMode.TIL1;
        this.tileOrientation = TileOrientation.LEFT_RIGHT;
        this.tileMapWidth = 0;
        this.tileMapHeight = 0;
        this.tileMapAddress = 0x0000;
        this.tileSetAddress = 0x0000;
        this.tileSetLength = 0;

        const value = Math.pow(2, this.tileMode);
        this.tileWidth = value;
        this.tileHeight = value;
        this.tileSize = (this.tileWidth * this.tileHeight * this.colorMode) / 8; // number of bytes per tile
        this.screenWidth = this.tileMapWidth * value;
        this.screenHeight = this.tileMapHeight * value;

        this.tileMapLength = this.tileMapWidth * this.tileMapHeight;

        this.tileSet = [];
        this.colorTable = [];

        this.loadTileSetFromMem();
        this.loadColorTableFromMem();

        this.drawBackground();
    }

    // ----------------------------------------

    loadTileSetFromMem() {
        this.tileSet = [];
        for (let i = 0; i < this.tileSetLength; i++) this.tileSet.push(this.readTileFromMem(i));
    }

    // ----------------------------------------

    loadColorTableFromMem() {
        this.colorTable = [];
        for (let i = 0; i < Math.pow(2, this.colorMode); i++) {
            // % 0xfff is failsave: It is possible due to misconfiguration that addresses are beyond 64K
            const r = this.mem.int[(this.colorTableAddress + i * 4 + 0) % 0xffff];
            const g = this.mem.int[(this.colorTableAddress + i * 4 + 1) % 0xffff];
            const b = this.mem.int[(this.colorTableAddress + i * 4 + 2) % 0xffff];
            const a = this.mem.int[(this.colorTableAddress + i * 4 + 3) % 0xffff];
            this.colorTable.push(new Color(r, g, b, a));
        }
    }

    // ----------------------------------------

    drawScreen() {
        this.drawBackground();

        if (this.tileOrientation === TileOrientation.LEFT_RIGHT) {
            for (let y = 0; y < this.tileMapHeight; y++) {
                for (let x = 0; x < this.tileMapWidth; x++) {
                    this.drawTile(x, y, this.mem.int[this.tileMapAddress + y * this.tileSize + x]);
                }
            }
        }
    }

    // ----------------------------------------

    drawTile(x: number, y: number, tileIndex: number) {
        if (!this.ctx) return;
        if (this.tileSetLength === 0) return;

        /*         if (tileIndex === 94) {
            console.log(x, y, tileIndex);
        } */

        const imgData = this.ctx.createImageData(this.tileWidth, this.tileHeight);

        let tile = this.tileSet[tileIndex];

        let dgb = [];

        for (let y = 0; y < this.tileHeight; y++) {
            dgb = [];

            for (let x = 0; x < this.tileWidth; x++) {
                const colorStart = y * (this.tileWidth * this.colorMode) + x * this.colorMode;
                const colorIndex = parseInt(tile.bitmap.slice(colorStart, colorStart + this.colorMode).join(''), 2);

                dgb.push(colorIndex);

                const pixelOffset = y * this.tileWidth * 4 + x * 4;

                imgData.data[pixelOffset + 0] = this.colorTable[colorIndex].r; // Red
                imgData.data[pixelOffset + 1] = this.colorTable[colorIndex].g; // Green
                imgData.data[pixelOffset + 2] = this.colorTable[colorIndex].b; // Blue
                imgData.data[pixelOffset + 3] = this.colorTable[colorIndex].a; // Alpha

                /*                 if (tileIndex === 94) {
                    // drawing the prompt
                    console.log(
                        'color:',
                        this.colorTable[colorIndex].r,
                        this.colorTable[colorIndex].g,
                        this.colorTable[colorIndex].b,
                        this.colorTable[colorIndex].a
                    );
                } */
            }

            //if (tileIndex === 94) {
            // drawing the prompt
            //console.log('bits:', dgb.join(''));
            //}
        }

        /*         if (tileIndex === 94) {
            // drawing the prompt
            console.log('imgData:', imgData);
        } */

        this.ctx.putImageData(imgData, x * this.tileWidth, y * this.tileHeight);

        /*         if (tileIndex === 94) {
            console.log('imgData w h x y:', imgData.width, imgData.height, x, y);
        } */
    }

    // ----------------------------------------

    readTileFromMem(tileIndex: number) {
        //console.log('readTileFromMem tileIndex:', tileIndex, 'tileSetAddress:', this.tileSetAddress);

        const tileAddress = this.tileSetAddress + tileIndex * this.tileSize;

        const tileBitmap = [];

        const tileWidthBytes = (this.tileWidth / 8) * this.colorMode;

        for (let y = 0; y < this.tileHeight; y++) {
            for (let x = 0; x < tileWidthBytes; x++) {
                //console.log(tileAddress + y * tileWidthBytes + x);

                const offsetTileByte = tileAddress + y * tileWidthBytes + x;

                // % 0xfff is failsave: It is possible due to misconfiguration that addresses are beyond 64K
                const value = this.mem.int[offsetTileByte % 0xffff]
                    .toString(2)
                    .padStart(8, '0')
                    .split('')
                    .map(x => parseInt(x)); // int to binary array e.g. [1, 0, 0, 1, 0, 1, 0, 0]
                tileBitmap.push(value);
            }
        }

        const tile = new Tile(tileBitmap.flat()); // flattened bitmap array containing all bits of the tile w*h*c

        return tile;
    }

    // ----------------------------------------

    /*     resetAllRegisters() {
        this.colorMode = this.mem.int[registerColorMode] & 0b00000111; // only lower 3 bits
        this.colorTableAddress = (this.mem.int[registerColorTableAddress + 1] << 8) | this.mem.int[registerColorTableAddress];
        this.tileMode = this.mem.int[registerTileModeOrientation] & 0b00000111; // only lower 3 bits
        this.tileOrientation = this.mem.int[registerTileModeOrientation] & 0b00001000; // only 4th bit
        this.tileMapWidth = this.mem.int[registerTileMapWidth];
        this.tileMapHeight = this.mem.int[registerTileMapHeight];
        this.tileMapAddress = (this.mem.int[registerTileMapAddress + 1] << 8) | this.mem.int[registerTileMapAddress];
        this.tileSetAddress = (this.mem.int[registerTileSetAddress + 1] << 8) | this.mem.int[registerTileSetAddress];
        this.tileSetLength = this.mem.int[registerTileSetLength];

        const value = Math.pow(2, this.tileMode);
        this.tileWidth = value;
        this.tileHeight = value;
        this.tileSize = (this.tileWidth * this.tileHeight * this.colorMode) / 8; // number of bytes per tile
        this.screenWidth = this.tileMapWidth * value;
        this.screenHeight = this.tileMapHeight * value;

        this.tileMapLength = this.tileMapWidth * this.tileMapHeight * this.colorMode * (this.tileWidth / 8) * this.tileHeight;

        this.loadTileSetFromMem();
        this.loadColorTableFromMem();

        console.log(`colorMode: ${this.colorMode}`);
        console.log(`colorTableAddress: ${this.colorTableAddress.toString(16).toUpperCase().padStart(4, '0')}`);
        console.log(`tileMode: ${this.tileMode}`);
        console.log(`tileOrientation: ${this.tileOrientation}`);
        console.log(`tileMapWidth: ${this.tileMapWidth}`);
        console.log(`tileMapHeight: ${this.tileMapHeight}`);
        console.log(`tileMapAddress: ${this.tileMapAddress.toString(16).toUpperCase().padStart(4, '0')}`);
        console.log(`tileSetAddress: ${this.tileSetAddress.toString(16).toUpperCase().padStart(4, '0')}`);
        console.log(`tileSetLength: ${this.tileSetLength}`);
        console.log(`tileWidth: ${this.tileWidth}`);
        console.log(`tileHeight: ${this.tileHeight}`);
        console.log(`tileSize: ${this.tileSize}`);
        console.log(`screenWidth: ${this.screenWidth}`);
        console.log(`screenHeight: ${this.screenHeight}`);
    } */

    // ----------------------------------------

    setCtx(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    // ----------------------------------------

    checkMemWrite(index: number) {
        // check writing to tile map
        if (index >= this.tileMapAddress && index < this.tileMapAddress + this.tileMapLength) {
            const tmpIndex = index - this.tileMapAddress;
            const x = tmpIndex % this.tileMapWidth;
            const y = Math.floor(tmpIndex / this.tileMapWidth);
            this.drawTile(x, y, this.mem.int[index]);
        }

        // check writing to tile set
        if (index >= this.tileSetAddress && index < this.tileSetAddress + this.tileSetLength * this.tileHeight * this.colorMode) {
            const tileIndex = Math.floor((index - this.tileSetAddress) / 8);

            this.tileSet[tileIndex] = this.readTileFromMem(tileIndex);
        }

        let value;

        switch (index) {
            case registerColorMode:
                console.log('registerColorMode');
                /*                 this.resetAllRegisters();
                break; */
                this.colorMode = this.mem.int[registerColorMode];
                console.log(`new colorMode: ${this.colorMode.toString(16).toUpperCase().padStart(2, '0')}`);
                this.tileSize = (this.tileWidth * this.tileHeight * this.colorMode) / 8; // number of bytes per tile
                this.loadTileSetFromMem();
                this.loadColorTableFromMem();
                break;
            case registerColorTableAddress:
            case registerColorTableAddress + 1:
                console.log('registerColorTableAddress');
                /*                 this.resetAllRegisters();
                break; */
                this.colorTableAddress = (this.mem.int[registerColorTableAddress + 1] << 8) | this.mem.int[registerColorTableAddress];
                console.log(`new colorTableAddress: ${this.colorTableAddress.toString(16).toUpperCase().padStart(4, '0')}`);
                this.loadColorTableFromMem();
                break;
            case registerTileModeOrientation:
                console.log('registerTileModeOrientation');
                /*                 this.resetAllRegisters();
                break; */
                this.tileMode = this.mem.int[registerTileModeOrientation] & 0b00000111; // only lower 3 bits
                console.log(`new tileMode: ${this.tileMode.toString(16).toUpperCase().padStart(2, '0')}`);
                this.tileOrientation = this.mem.int[registerTileModeOrientation] & 0b00001000; // only 4th bit
                console.log(`new tileOrientation: ${this.tileOrientation.toString(16).toUpperCase().padStart(2, '0')}`);
                value = Math.pow(2, this.tileMode);
                this.tileWidth = value;
                this.tileHeight = value;
                this.tileSize = (this.tileWidth * this.tileHeight * this.colorMode) / 8; // number of bytes per tile
                this.screenWidth = this.tileMapWidth * value;
                this.screenHeight = this.tileMapHeight * value;
                this.loadTileSetFromMem();
                break;
            case registerTileMapWidth:
                console.log('registerTileMapWidth');
                /*                 this.resetAllRegisters();
                break; */
                this.tileMapWidth = this.mem.int[registerTileMapWidth];
                console.log(`new tileMapWidth: ${this.tileMapWidth.toString(16).toUpperCase().padStart(2, '0')}`);
                value = Math.pow(2, this.tileMode);
                this.screenWidth = this.tileMapWidth * value;
                this.tileMapLength = this.tileMapWidth * this.tileMapHeight;
                break;
            case registerTileMapHeight:
                console.log('registerTileMapHeight');
                /*                 this.resetAllRegisters();
                break; */
                this.tileMapHeight = this.mem.int[registerTileMapHeight];
                console.log(`new tileMapHeight: ${this.tileMapHeight.toString(16).toUpperCase().padStart(2, '0')}`);
                value = Math.pow(2, this.tileMode);
                this.screenHeight = this.tileMapHeight * value;
                this.tileMapLength = this.tileMapWidth * this.tileMapHeight;
                break;
            case registerTileMapAddress:
            case registerTileMapAddress + 1:
                console.log('registerTileMapAddress');
                /*                 this.resetAllRegisters();
                break; */
                this.tileMapAddress = (this.mem.int[registerTileMapAddress + 1] << 8) | this.mem.int[registerTileMapAddress];
                console.log(`new tileMapAddress: ${this.tileMapAddress.toString(16).toUpperCase().padStart(4, '0')}`);
                break;
            case registerTileSetAddress:
            case registerTileSetAddress + 1:
                console.log('registerTileSetAddress');
                /*                 this.resetAllRegisters();
                break; */
                this.tileSetAddress = (this.mem.int[registerTileSetAddress + 1] << 8) | this.mem.int[registerTileSetAddress];
                console.log(`new tileSetAddress: ${this.tileSetAddress.toString(16).toUpperCase().padStart(4, '0')}`);
                this.loadTileSetFromMem();
                break;
            case registerTileSetLength:
                console.log('registerTileSetLength');
                /*                 this.resetAllRegisters();
                break; */
                this.tileSetLength = this.mem.int[registerTileSetLength];
                console.log(`new tileSetLength: ${this.tileSetLength.toString(16).toUpperCase().padStart(2, '0')}`);
                this.loadTileSetFromMem();
                break;

            default:
                break;
        }
    }

    // ----------------------------------------

    drawBackground() {
        if (!this.ctx) return;

        //DEBUG
        console.log('drawBackground');
        this.ctx.fillRect(0, 0, 320, 240);
        //DEBUG

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    }

    // ----------------------------------------
}

// ================================================================================

export class Tile {
    bitmap: number[];

    constructor(bitmap: number[]) {
        this.bitmap = bitmap;
    }
}

// ================================================================================

export class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

// ================================================================================
