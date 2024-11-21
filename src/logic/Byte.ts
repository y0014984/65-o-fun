// little endian 0-1-2-3-4-5-6-7 in memory
// but in string representation 0b76543210

export default class Byte {
    int: number = 0;
    bits: boolean[] = [false, false, false, false, false, false, false, false]; // indices 7-6-5-4-3-2-1-0

    constructor(value: number = 0) {
        this.setAsNumber(value);
    }

    getBitByIndex(index: number) {
        return this.bits[7 - index];
    }

    setAsNumber(value: number) {
        value = value % 256; // only numbers between 0 and 255 allowed
        if (value < 0) value = value + 256; // only positive number allowed

        this.int = value;

        this.setBitsFromByte();
    }

    getAsNumber() {
        return this.int;
    }

    getAsSignedNumber() {
        return this.int > 127 ? this.int - 256 : this.int;
    }

    setAsHexString(value: string) {
        if (value.length > 2) value = value.substring(value.length - 2);
        this.setAsNumber(parseInt(value, 16));
    }

    getAsHexString() {
        let value: string = '';

        value = value + '0x';

        // number to hex string with leading zeros
        value = value + this.int.toString(16).padStart(2, '0');

        return value;
    }

    setAsBitsString(value: string) {
        if (value.length > 8) value = value.substring(value.length - 8);
        this.setAsNumber(parseInt(value, 2));
    }

    getAsBitsString() {
        let value: string = '';

        value = value + '0b';

        // number to binary string with leading zeros
        value = value + this.int.toString(2).padStart(8, '0');

        return value;
    }

    private setBitsFromByte() {
        this.int
            .toString(2)
            .padStart(8, '0')
            .split('')
            .forEach((element, index) => {
                this.bits[index] = !!element;
            });
    }
}
