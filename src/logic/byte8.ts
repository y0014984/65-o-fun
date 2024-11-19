// little endian 0-1-2-3-4-5-6-7 in memory
// but in string representation 0b76543210

export default class Byte8 {
    byte: number = 0;
    bits: boolean[] = [false, false, false, false, false, false, false, false];

    constructor(value: number = 0) {
        this.setAsNumber(value);
    }

    setAsNumber(value: number) {
        if (value < 0) value = value * -1; // only positive number allowed
        value = value % 256; // only numbers between 0 and 255 allowed

        this.byte = value;

        this.setBitsFromByte();
    }

    getAsNumber() {
        return this.byte;
    }

    setAsHexString(value: string) {
        if (value.length > 2) value = value.substring(value.length - 2);
        this.setAsNumber(parseInt(value, 16));
    }

    getAsHexString() {
        let value: string = '';

        value = value + '0x';

        // number to hex string with leading zeros
        value = value + this.byte.toString(16).padStart(2, '0');

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
        value = value + this.byte.toString(2).padStart(8, '0');

        return value;
    }

    private setBitsFromByte() {
        this.byte
            .toString(2)
            .padStart(8, '0')
            .split('')
            .forEach((element, index) => {
                this.bits[index] = !!element;
            });
    }
}
