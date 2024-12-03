import Byte from './Byte';

export default class Word {
    lowByte: Byte;
    highByte: Byte;

    constructor(lowByteOperand: Byte = new Byte(), highByteOperand: Byte = new Byte()) {
        this.lowByte = lowByteOperand;
        this.highByte = highByteOperand;
    }

    getInt() {
        return this.lowByte.getInt() + 256 * this.highByte.getInt();
    }

    setInt(value: number) {
        const highByte = Math.floor(value / 256);
        const lowByte = value % 256;

        this.highByte.setInt(highByte);
        this.lowByte.setInt(lowByte);
    }
}
