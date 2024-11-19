import Byte from './Byte';

export default class ProcessorStatusRegister extends Byte {
    constructor(value: number = 0) {
        super(value);
    }

    getZeroFlag() {
        return this.bits[1];
    }

    setNegativeStatusFlag(flag: boolean) {
        this.bits[7] = flag;
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
        this.byte = parseInt(tmpBits.join(''), 2);
    }
}
