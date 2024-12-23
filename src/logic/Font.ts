export class Font {
    table: Letter[] = [];

    constructor() {}

    updateFont(letterCode: string, letterBitmap: number[][]) {
        const index = this.table.findIndex(letter => {
            return letter.letterCode === letterCode ? true : false;
        });

        const letter = new Letter(letterCode, letterBitmap);

        if (index === -1) {
            this.table.push(letter);
        } else {
            this.table[index] = letter;
        }
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
