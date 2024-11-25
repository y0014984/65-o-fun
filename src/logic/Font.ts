export default class Font {
    table: Letter[] = [];

    constructor() {
        this.table.push(new Letter('41', letterCapitalA));
    }
}

export class Letter {
    letterCode: string;
    letterBitmap: number[][];

    constructor(letterCode: string, letterBitmap: number[][]) {
        this.letterCode = letterCode;
        this.letterBitmap = letterBitmap;
    }
}

export const letterCapitalA = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
