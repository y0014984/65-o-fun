// little endian 0-1-2-3-4-5-6-7 in memory
// but in string representation '76543210'

export default class Byte {
    private int: number = 0;
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
}
