import Byte from './Byte';

export default class ProcessorStatusRegister extends Byte {
    constructor(value: number = 0) {
        super(value);

        this.initRegister();
    }

    initRegister() {
        this.setNegativeFlag(false);
        this.setOverflowFlag(false);
        this.setExpansionBit();
        this.setBreakFlag(true);
        this.setDecimalFlag(false);
        this.setInterruptFlag(false);
        this.setZeroFlag(false);
        this.setCarryFlag(false);
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
    }

    setOverflowFlag(flag: boolean) {
        this.setBitByIndex(6, flag);
    }

    setExpansionBit() {
        this.setBitByIndex(5, true);
    }

    setBreakFlag(flag: boolean) {
        this.setBitByIndex(4, flag);
    }

    setDecimalFlag(flag: boolean) {
        this.setBitByIndex(3, flag);
    }

    setInterruptFlag(flag: boolean) {
        this.setBitByIndex(2, flag);
    }

    setZeroFlag(flag: boolean) {
        this.setBitByIndex(1, flag);
    }

    setCarryFlag(flag: boolean) {
        this.setBitByIndex(0, flag);
    }
}
