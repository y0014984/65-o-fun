import Byte from './Byte';

export default class ProcessorStatusRegister extends Byte {
    constructor(value: number = 0) {
        super(value);

        this.setBreakFlag(true);
        this.setExpansionBit(true);
    }

    getNegativeFlag() {
        return this.bits[7];
    }

    getOverflowFlag() {
        return this.bits[6];
    }

    getBreakFlag() {
        return this.bits[4];
    }

    getDecimalFlag() {
        return this.bits[3];
    }

    getInterruptFlag() {
        return this.bits[2];
    }

    getZeroFlag() {
        return this.bits[1];
    }

    getCarryFlag() {
        return this.bits[0];
    }

    setNegativeFlag(flag: boolean) {
        this.bits[7] = flag;
        this.setByteFromBits();
    }

    setOverflowFlag(flag: boolean) {
        this.bits[6] = flag;
        this.setByteFromBits();
    }

    setExpansionBit(flag: boolean) {
        this.bits[5] = flag;
        this.setByteFromBits();
    }

    setBreakFlag(flag: boolean) {
        this.bits[4] = flag;
        this.setByteFromBits();
    }

    setDecimalFlag(flag: boolean) {
        this.bits[3] = flag;
        this.setByteFromBits();
    }

    setInterruptFlag(flag: boolean) {
        this.bits[2] = flag;
        this.setByteFromBits();
    }

    setZeroFlag(flag: boolean) {
        this.bits[1] = flag;
        this.setByteFromBits();
    }

    setCarryFlag(flag: boolean) {
        this.bits[0] = flag;
        this.setByteFromBits();
    }

    private setByteFromBits() {
        const tmpBits: string[] = [];
        this.bits.forEach((element, index) => (tmpBits[index] = element ? '1' : '0'));
        this.int = parseInt(tmpBits.join(''), 2);
    }
}
