export default class Memory {
    int: number[];
    private onChange: (index: number) => void;

    constructor(size: number = 65536, callback: (index: number) => void) {
        this.onChange = callback;

        this.int = [];
        for (let i = 0; i < size; i++) {
            this.int.push(0);
        }
    }

    setInt(index: number, value: number) {
        value = value % 256; // only numbers between 0 and 255 allowed
        if (value < 0) value = value + 256; // only positive number allowed

        this.int[index] = value;

        this.onChange(index);
    }

    setAsHexString(index: number, hexString: string) {
        hexString = hexString.toUpperCase().padStart(2, '0'); // only uppercase, min 2 digits
        hexString = hexString.substring(hexString.length - 2); // only the las to digits

        let value = parseInt(hexString, 16);

        this.int[index] = isNaN(value) ? 0 : value;

        this.onChange(index);
    }

    getAsSignedInt(index: number) {
        return this.int[index] > 127 ? this.int[index] - 256 : this.int[index];
    }

    getAsHexString(index: number) {
        return this.int[index].toString(16).toUpperCase().padStart(2, '0');
    }

    setBitByIndex(index: number, bitIndex: number, enabled: boolean) {
        if (enabled) {
            this.int[index] = this.int[index] & (1 << bitIndex);
        } else {
            this.int[index] = this.int[index] & ~(1 << bitIndex);
        }
    }

    inc(index: number) {
        this.int[index]++;
        if (this.int[index] > 255) this.int[index] = this.int[index] % 256;
    }

    dec(index: number) {
        this.int[index]--;
        if (this.int[index] < 0) this.int[index] = 256 + this.int[index]; // this.int is negative
    }

    shiftLeft(index: number) {
        // C-B-B-B-B-B-B-B-0 <<

        const newBitsWithCarry = (this.int[index] << 1).toString(2).slice(-9).padStart(9, '0');
        const carry = newBitsWithCarry[0] === '1' ? true : false;
        const newValue = parseInt(newBitsWithCarry.substring(1, 9), 2);

        this.setInt(index, newValue);

        return carry;
    }

    shiftRight(index: number) {
        // >> 0-B-B-B-B-B-B-B-C
        const newBitsWithCarry = ((this.int[index] << 1) >>> 1).toString(2).slice(-9).padStart(9, '0');
        const carry = newBitsWithCarry[8] === '1' ? true : false;
        const newValue = parseInt(newBitsWithCarry.substring(0, 8), 2);

        this.setInt(index, newValue);

        return carry;
    }

    rotateLeft(index: number, carry: number) {
        // (new)C-B-B-B-B-B-B-B-B-C(old) <<
        const value = this.int[index].toString(2).padStart(8, '0');
        const bitsWithCarry = `${value}${carry}`;
        const newCarry = bitsWithCarry.substring(0, 1) === '1' ? true : false;
        const newValue = parseInt(bitsWithCarry.substring(1, 9), 2);

        this.setInt(index, newValue);

        return newCarry;
    }

    rotateRight(index: number, carry: number) {
        // >> (old)C-B-B-B-B-B-B-B-B-C(new)
        const value = this.int[index].toString(2).padStart(8, '0');
        const bitsWithCarry = `${carry}${value}`;
        const newCarry = bitsWithCarry.substring(8, 9) === '1' ? true : false;
        const newValue = parseInt(bitsWithCarry.substring(0, 8), 2);

        this.setInt(index, newValue);

        return newCarry;
    }
}
