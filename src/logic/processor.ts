import Byte8 from './byte8';

export default class Processor {
    mem: Byte8[] = [];
    ir: Byte8 = new Byte8(); // Instruction Register (1 Byte)
    a: Byte8 = new Byte8(); // Accumulator Register (1 Byte)
    pc: Byte8[] = [new Byte8(), new Byte8()]; // Programm Counter Register (2 Bytes)

    constructor(memory: Byte8[]) {
        this.mem = memory;
    }

    processInstruction() {
        this.fetchInstruction();

        console.log(this.ir.getAsHexString());

        switch (this.ir.getAsHexString()) {
            case '0xa9':
                this.ldaImmediate(this.fetchByte());
                break;

            case '0x85':
                this.staZeroPage(this.fetchByte());
                break;

            case '0xe6':
                this.incZeroPage(this.fetchByte());
                break;

            default:
                break;
        }
    }

    fetchInstruction() {
        this.ir.setAsNumber(this.fetchByte().byte);
    }

    fetchByte() {
        const offset = this.twoBytesToNumber(this.pc);
        this.pcIncr();
        return this.mem[offset];
    }

    twoBytesToNumber(bytes: Byte8[] = [new Byte8(), new Byte8()]) {
        return bytes[0].byte + 256 * bytes[1].byte;
    }

    pcIncr() {
        const overflowLowByte = this.incrementByte(this.pc[0]);
        if (overflowLowByte) {
            console.log(`Overflow LowByte after: ${this.pc[0].getAsNumber()}`);
            const overflowHighByte = this.incrementByte(this.pc[1]);
            if (overflowHighByte) {
                console.log(`Overflow High Byte after: ${this.pc[0].getAsNumber()}`);
            }
        }
    }

    /* === COMMANDS === */

    ldaImmediate(value: Byte8) {
        // A9
        this.a.setAsNumber(value.byte);
    }

    staZeroPage(zpAddr: Byte8) {
        // 85
        this.mem[zpAddr.byte].setAsNumber(this.a.byte);
    }

    incZeroPage(zpAddr: Byte8) {
        // E6
        this.incrementByte(this.mem[zpAddr.byte]);
    }

    /* === COMMAND HELPER === */

    incrementByte(byte: Byte8) {
        let value = byte.getAsNumber();
        value++;
        const newValue = value % 256; // only numbers between 0 and 255 allowed
        byte.setAsNumber(newValue);

        // return true if overflow
        return value !== newValue ? true : false;
    }
}
