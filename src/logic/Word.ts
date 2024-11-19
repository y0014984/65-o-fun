import Byte from './Byte';

export default class Word {
    lowByte: Byte;
    highByte: Byte;

    constructor(lowByteOperand: Byte = new Byte(), highByteOperand: Byte = new Byte()) {
        this.lowByte = lowByteOperand;
        this.highByte = highByteOperand;
    }

    getAsNumber() {
        return this.lowByte.int + 256 * this.highByte.int;
    }
}
