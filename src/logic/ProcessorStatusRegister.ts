import Byte from './Byte';

export default class ProcessorStatusRegister extends Byte {
    constructor(value: number = 0) {
        super(value);

        this.setBreakFlag(true);
        this.setExpansionBit();
    }

    getNegativeFlag() {
        return this.getBitByIndex(7);
    }

    getOverflowFlag() {
        return this.getBitByIndex(6);
    }

    getExpansionBit() {
        return this.getBitByIndex(5);
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
        this.setBitByIndex(7, flag);
        this.setByteFromBits();
    }

    setOverflowFlag(flag: boolean) {
        this.setBitByIndex(6, flag);
        this.setByteFromBits();
    }

    setExpansionBit() {
        this.setBitByIndex(5, true);
        this.setByteFromBits();
    }

    setBreakFlag(flag: boolean) {
        this.setBitByIndex(4, flag);
        this.setByteFromBits();
    }

    setDecimalFlag(flag: boolean) {
        this.setBitByIndex(3, flag);
        this.setByteFromBits();
    }

    setInterruptFlag(flag: boolean) {
        this.setBitByIndex(2, flag);
        this.setByteFromBits();
    }

    setZeroFlag(flag: boolean) {
        this.setBitByIndex(1, flag);
        this.setByteFromBits();
    }

    setCarryFlag(flag: boolean) {
        this.setBitByIndex(0, flag);
        this.setByteFromBits();
    }
}
