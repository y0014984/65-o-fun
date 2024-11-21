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
}
