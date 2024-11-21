import Byte from './Byte';

export default class ProcessorStatusRegister extends Byte {
    constructor(value: number = 0) {
        super(value);

        this.setBreakFlag(true);
        this.setExpansionBit(true);
    }

    getNegativeFlag() {
        return this.getBitByIndex(7);
    }

    getOverflowFlag() {
        return this.getBitByIndex(6);
    }

    getBreakFlag() {
        return this.getBitByIndex(4);
    }

    getDecimalFlag() {
        return this.getBitByIndex(3);
    }

    getInterruptFlag() {
        return this.getBitByIndex(2);
    }

    getZeroFlag() {
        return this.getBitByIndex(1);
    }

    getCarryFlag() {
        return this.getBitByIndex(0);
    }

    setNegativeFlag(flag: boolean) {
        this.getBitByIndex(7) = flag;
        this.setByteFromBits();
    }

    setOverflowFlag(flag: boolean) {
        this.getBitByIndex(6) = flag;
        this.setByteFromBits();
    }

    setExpansionBit(flag: boolean) {
        this.getBitByIndex(5) = flag;
        this.setByteFromBits();
    }

    setBreakFlag(flag: boolean) {
        this.getBitByIndex(4) = flag;
        this.setByteFromBits();
    }

    setDecimalFlag(flag: boolean) {
        this.getBitByIndex(3) = flag;
        this.setByteFromBits();
    }

    setInterruptFlag(flag: boolean) {
        this.getBitByIndex(2) = flag;
        this.setByteFromBits();
    }

    setZeroFlag(flag: boolean) {
        this.getBitByIndex(1) = flag;
        this.setByteFromBits();
    }

    setCarryFlag(flag: boolean) {
        this.getBitByIndex(0) = flag;
        this.setByteFromBits();
    }

    private setByteFromBits() {
        const tmpBits: string[] = [];
        this.bits.forEach((element, index) => (tmpBits[index] = element ? '1' : '0'));
        this.int = parseInt(tmpBits.join(''), 2);
    }
}
