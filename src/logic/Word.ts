export default class Word {
    int: Uint16Array = new Uint16Array(1);

    constructor(lowByte: number = 0, highByte: number = 0) {
        this.int[0] = lowByte + 256 * highByte;
    }

    setAsHexString(lowByteHex: string, highByteHex: string) {
        const lowByte = parseInt(lowByteHex, 16);
        const highByte = parseInt(highByteHex, 16);

        this.int[0] = lowByte + 256 * highByte;
    }

    setInt(lowByte: number, highByte: number) {
        this.int[0] = lowByte + 256 * highByte;
    }

    getLowByte() {
        return this.int[0] & 0x00ff;
    }

    getHighByte() {
        return (this.int[0] & 0xff00) >> 8;
    }

    setHighByte(highByte: number) {
        this.int[0] = (this.int[0] & 0x00ff) + 256 * highByte;
    }

    setLowByte(lowByte: number) {
        this.int[0] = lowByte + 256 * ((this.int[0] & 0xff00) >> 8);
    }
}
