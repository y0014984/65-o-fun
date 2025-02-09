// little endian 0-1-2-3-4-5-6-7 in memory
// but in string representation '76543210'

export default class Byte {
    int: Uint8Array = new Uint8Array(1);

    constructor(value: number = 0) {
        this.int[0] = value;
    }

    public setInt(value: number) {
        this.int[0] = value;
    }

    public setAsHexString(value: string) {
        value = value.toUpperCase();
        if (value.length < 2) value = value.padStart(2, '0');
        this.setInt(parseInt(value, 16));
    }

    public getAsHexString() {
        // number to hex string with leading zeros
        return this.int[0].toString(16).toUpperCase().padStart(2, '0');
        // Uint8Array.toHex() currently not supported by Chrome due to a bug, see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex
    }

    public setAsBitString(value: string) {
        if (value.length > 8) value = value.substring(value.length - 8);
        this.setInt(parseInt(value, 2));
    }

    public getAsBitString() {
        // number to binary string with leading zeros
        return this.int[0].toString(2).padStart(8, '0');
    }
}
