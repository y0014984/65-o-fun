export default class Memory {
    int: number[];
    private onChangeGfx: (index: number) => void;
    private onChangeSnd: (index: number) => void;
    private onChangeStor: (index: number) => void;

    constructor(
        size: number = 65536,
        callbackGfx: (index: number) => void,
        callbackSnd: (index: number) => void,
        callbackStor: (index: number) => void
    ) {
        this.onChangeGfx = callbackGfx;
        this.onChangeSnd = callbackSnd;
        this.onChangeStor = callbackStor;

        this.int = [];
        for (let i = 0; i < size; i++) {
            this.int.push(0);
        }
    }

    reset() {
        this.int.forEach((_element, index) => {
            this.int[index] = 0;
        });
    }

    setInt(index: number, value: number) {
        value = value % 256; // only numbers between 0 and 255 allowed
        if (value < 0) value = value + 256; // only positive number allowed

        this.int[index] = value;

        this.onChangeGfx(index);
        this.onChangeSnd(index);
        this.onChangeStor(index);
    }

    setAsHexString(index: number, hexString: string) {
        hexString = hexString.toUpperCase().padStart(2, '0'); // only uppercase, min 2 digits
        hexString = hexString.substring(hexString.length - 2); // only the las to digits

        let value = parseInt(hexString, 16);

        this.int[index] = isNaN(value) ? 0 : value;

        this.onChangeGfx(index);
        this.onChangeSnd(index);
        this.onChangeStor(index);
    }

    getAsHexString(index: number) {
        return this.int[index].toString(16).toUpperCase().padStart(2, '0');
    }

    setBitByIndex(index: number, bitIndex: number, enabled: boolean) {
        if (enabled) {
            // set
            this.int[index] = this.int[index] | (1 << bitIndex);
        } else {
            // reset
            this.int[index] = this.int[index] & ~(1 << bitIndex);
        }

        this.onChangeGfx(index);
        this.onChangeSnd(index);
        this.onChangeStor(index);
    }

    inc(index: number) {
        this.int[index]++;
        if (this.int[index] > 255) this.int[index] = this.int[index] % 256;

        this.onChangeGfx(index);
        this.onChangeSnd(index);
        this.onChangeStor(index);
    }

    dec(index: number) {
        this.int[index]--;
        if (this.int[index] < 0) this.int[index] = 256 + this.int[index]; // this.int is negative

        this.onChangeGfx(index);
        this.onChangeSnd(index);
        this.onChangeStor(index);
    }
}
