import Byte8 from './byte8';

export default class Processor {
    mem: Byte8[] = [];
    ir: Byte8 = new Byte8(); // Instruction Register (1 Byte)
    a: Byte8 = new Byte8(); // Accumulator Register (1 Byte)
    y: Byte8 = new Byte8(); // Index Register Y (1 Byte)
    x: Byte8 = new Byte8(); // Index Register X (1 Byte)
    pc: Byte8[] = [new Byte8(), new Byte8()]; // Programm Counter Register (2 Bytes)
    s: Byte8 = new Byte8(); // Stack Pointer Register (1 Byte)
    p: Byte8 = new Byte8(); // Processor Status Register (1 Byte)

    constructor(memory: Byte8[]) {
        this.mem = memory;

        this.initRegisters();
    }

    initRegisters() {
        this.s.setAsHexString('0xff');
    }

    processInstruction() {
        this.fetchInstruction();

        console.log(this.ir.getAsHexString());

        switch (this.ir.getAsHexString()) {
            case '0xa9': // LDA
                this.ldaImmediate(this.fetchByte());
                break;

            case '0x85': // STA
                this.staZeroPage(this.fetchByte());
                break;

            case '0xe6': // INC
                this.incZeroPage(this.fetchByte());
                break;

            case '0x4c': // JMP
                this.jmp(this.fetchByte(), this.fetchByte());
                break;

            case '0x20': // JSR
                this.jsr(this.fetchByte(), this.fetchByte());
                break;

            case '0x60': // RTS
                this.rts();
                console.log(this.pc[0].byte);
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
            this.incrementByte(this.pc[1]);
        }
    }

    pcDecr() {
        const underflowLowByte = this.decrementByte(this.pc[0]);
        if (underflowLowByte) {
            this.decrementByte(this.pc[1]);
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

    jmp(byteLow: Byte8, byteHigh: Byte8) {
        this.pc[0].setAsNumber(byteLow.byte);
        this.pc[1].setAsNumber(byteHigh.byte);
    }

    jsr(byteLow: Byte8, byteHigh: Byte8) {
        // pc is already incr by 3 through fetching
        // reduce by 1 for compatibility
        this.pcDecr();

        this.pushOnStack(this.pc[1].byte);
        this.pushOnStack(this.pc[0].byte);

        this.pc[0].setAsNumber(byteLow.byte);
        this.pc[1].setAsNumber(byteHigh.byte);
    }

    rts() {
        this.pc[0].setAsNumber(this.pullFromStack());
        this.pc[1].setAsNumber(this.pullFromStack());
        this.pcIncr();
    }

    /* === COMMAND HELPER === */

    pushOnStack(value: number) {
        this.mem[255 + this.s.byte].setAsNumber(value);
        this.decrementByte(this.s);
    }

    pullFromStack() {
        this.incrementByte(this.s);
        return this.mem[255 + this.s.byte].byte;
    }

    incrementByte(byte: Byte8) {
        let value = byte.byte;
        value++;
        const newValue = value % 256; // overflow
        byte.setAsNumber(newValue);

        // return true if overflow
        return value !== newValue ? true : false;
    }

    decrementByte(byte: Byte8) {
        let value = byte.byte;
        value--;
        const newValue = value < 0 ? 256 - value : value; // underflow
        byte.setAsNumber(newValue);

        // return true if underflow
        return value !== newValue ? true : false;
    }
}
