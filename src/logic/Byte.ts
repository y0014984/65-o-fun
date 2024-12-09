// little endian 0-1-2-3-4-5-6-7 in memory
// but in string representation '76543210'

export default class Byte {
    int: number = 0;
    private bits: boolean[] = [false, false, false, false, false, false, false, false]; // least significant byte is at index 0

    constructor(value: number = 0) {
        this.setInt(value);
    }

    public getBitArray() {
        return this.bits;
    }

    public getBitByIndex(index: number) {
        return this.bits[index];
    }

    public setBitByIndex(index: number, value: boolean) {
        this.bits[index] = value;

        this.setByteFromBits();
    }

    public getInt() {
        return this.int;
    }

    public setInt(value: number) {
        value = value % 256; // only numbers between 0 and 255 allowed
        if (value < 0) value = value + 256; // only positive number allowed

        this.int = value;

        this.setBitsFromByte();
    }

    public getAsSignedInt() {
        return this.getInt() > 127 ? this.getInt() - 256 : this.getInt();
    }

    public setAsHexString(value: string) {
        value = value.toUpperCase();
        if (value.length < 2) value = value.padStart(2, '0');
        this.setInt(parseInt(value, 16));
    }

    public getAsHexString() {
        // number to hex string with leading zeros
        return this.getInt().toString(16).toUpperCase().padStart(2, '0');
    }

    public setAsBitString(value: string) {
        if (value.length > 8) value = value.substring(value.length - 8);
        this.setInt(parseInt(value, 2));
    }

    public getAsBitString() {
        // number to binary string with leading zeros
        return this.getInt().toString(2).padStart(8, '0');
    }

    protected setBitsFromByte() {
        this.getInt()
            .toString(2)
            .padStart(8, '0')
            .split('')
            .reverse()
            .forEach((element, index) => (this.bits[index] = element === '1' ? true : false));
    }

    protected setByteFromBits() {
        const tmpBits: string[] = [];
        this.getBitArray().forEach((element, index) => (tmpBits[index] = element ? '1' : '0'));
        this.setInt(parseInt(tmpBits.reverse().join(''), 2));
    }

    inc() {
        this.int++;
        if (this.int > 255) this.int = this.int % 256;
    }

    dec() {
        this.int--;
        if (this.int < 0) this.int = 256 + this.int; // this.int is negative
    }

    shiftLeft() {
        // C-B-B-B-B-B-B-B-0 <<

        const newBitsWithCarry = (this.int << 1).toString(2).slice(-9).padStart(9, '0');
        const carry = newBitsWithCarry[0] === '1' ? true : false;
        const newValue = parseInt(newBitsWithCarry.substring(1, 9), 2);

        this.setInt(newValue);

        return carry;
    }

    shiftRight() {
        // >> 0-B-B-B-B-B-B-B-C
        const newBitsWithCarry = ((this.int << 1) >>> 1).toString(2).slice(-9).padStart(9, '0');
        const carry = newBitsWithCarry[8] === '1' ? true : false;
        const newValue = parseInt(newBitsWithCarry.substring(0, 8), 2);

        this.setInt(newValue);

        return carry;
    }

    rotateLeft(carry: number) {
        // (new)C-B-B-B-B-B-B-B-B-C(old) <<
        const value = this.int.toString(2).padStart(8, '0');
        const bitsWithCarry = `${value}${carry}`;
        const newCarry = bitsWithCarry.substring(0, 1) === '1' ? true : false;
        const newValue = parseInt(bitsWithCarry.substring(1, 9), 2);

        this.setInt(newValue);

        return newCarry;
    }

    rotateRight(carry: number) {
        // >> (old)C-B-B-B-B-B-B-B-B-C(new)
        const value = this.int.toString(2).padStart(8, '0');
        const bitsWithCarry = `${carry}${value}`;
        const newCarry = bitsWithCarry.substring(8, 9) === '1' ? true : false;
        const newValue = parseInt(bitsWithCarry.substring(0, 8), 2);

        this.setInt(newValue);

        return newCarry;
    }
}
