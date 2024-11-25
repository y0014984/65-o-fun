import Byte from './Byte';

export default class Memory {
    private mem: Byte[];
    private onChange: (index: number) => void;

    constructor(size: number = 65536, callback: (index: number) => void) {
        this.onChange = callback;

        this.mem = [];
        for (let i = 0; i < size; i++) {
            this.mem.push(new Byte());
        }
    }

    getMemArray() {
        return this.mem;
    }

    setInt(index: number, value: number) {
        this.mem[index].setInt(value);

        this.onChange(index);
    }

    getInt(index: number) {
        return this.mem[index].getInt();
    }

    getByte(index: number) {
        return this.mem[index];
    }

    setAsHexString(index: number, hexString: string) {
        this.mem[index].setAsHexString(hexString);

        this.onChange(index);
    }

    getAsHexString(index: number) {
        return this.mem[index].getAsHexString();
    }
}
