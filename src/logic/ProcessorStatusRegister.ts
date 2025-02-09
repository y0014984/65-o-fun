import Byte from './Byte';

export default class ProcessorStatusRegister extends Byte {
    constructor(value: number = 0) {
        super(value);

        this.initRegister();
    }

    public getBitByIndex(index: number) {
        return ((this.int[0] >>> index) & 1) === 1 ? true : false;
    }

    public setBitByIndex(bitIndex: number, enabled: boolean) {
        if (enabled) {
            // set
            this.int[0] = this.int[0] | (1 << bitIndex);
        } else {
            // reset
            this.int[0] = this.int[0] & ~(1 << bitIndex);
        }
    }

    initRegister() {
        this.setExpansionBit();
        this.setBreakFlag(true);
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
