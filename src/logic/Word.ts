export default class Word {
    int: number;

    constructor(lowByte: number = 0, highByte: number = 0) {
        this.int = lowByte + 256 * highByte;
    }

    setAsHexString(lowByteHex: string, highByteHex: string) {
        const lowByte = parseInt(lowByteHex, 16);
        const highByte = parseInt(highByteHex, 16);

        this.int = lowByte + 256 * highByte;
    }

    setInt(lowByte: number, highByte: number) {
        this.int = lowByte + 256 * highByte;
    }

    getLowByte() {
        return this.int & 0x00ff;
    }

    getHighByte() {
        return (this.int & 0xff00) >> 8;
    }

    setHighByte(highByte: number) {
        this.int = (this.int & 0x00ff) + 256 * highByte;
    }

    inc() {
        this.int++;
        if (this.int > 65535) this.int = this.int % 65536;
    }

    dec() {
        this.int--;
        if (this.int < 0) this.int = 65536 + this.int; // this.int is negative
    }
}
