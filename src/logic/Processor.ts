import Byte from './Byte';
import ProcessorStatusRegister from './ProcessorStatusRegister';
import Word from './Word';

export default class Processor {
    mem: Byte[] = [];
    ir: Byte = new Byte(); // Instruction Register (1 Byte)
    a: Byte = new Byte(); // Accumulator Register (1 Byte)
    y: Byte = new Byte(); // Index Register Y (1 Byte)
    x: Byte = new Byte(); // Index Register X (1 Byte)
    pc: Word = new Word(); // Programm Counter Register (2 Bytes)
    s: Byte = new Byte(); // Stack Pointer Register (1 Byte)
    p: ProcessorStatusRegister = new ProcessorStatusRegister(); // Processor Status Register (1 Byte)

    constructor(memory: Byte[]) {
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

            case '0xc9': // CMP
                this.cmpImmediate(this.fetchByte());
                break;

            case '0xd0': // BNE
                this.bne(this.fetchByte());
                break;

            case '0x4c': // JMP
                this.jmp(this.fetchByte(), this.fetchByte());
                break;

            case '0x20': // JSR
                this.jsr(this.fetchByte(), this.fetchByte());
                break;

            case '0x60': // RTS
                this.rts();
                break;

            default:
                break;
        }
    }

    fetchInstruction() {
        this.ir.setAsNumber(this.fetchByte().byte);
    }

    fetchByte() {
        const offset = this.pc.getAsNumber();
        this.incrementWord(this.pc);
        return this.mem[offset];
    }

    /* === COMMANDS === */

    ldaImmediate(value: Byte) {
        // A9
        this.a.setAsNumber(value.byte);
    }

    staZeroPage(zpAddr: Byte) {
        // 85
        this.mem[zpAddr.byte].setAsNumber(this.a.byte);
    }

    incZeroPage(zpAddr: Byte) {
        // E6
        this.incrementByte(this.mem[zpAddr.byte]);
    }

    cmpImmediate(operand: Byte) {
        const result = this.a.byte - operand.byte;

        this.p.setNegativeStatusFlag(result < 0);
        this.p.setZeroFlag(result === 0);
        this.p.setCarryFlag(result >= 0);

        //console.log(`A: ${this.a.byte} OP: ${operand.byte}`);
    }

    bne(operand: Byte) {
        this.addToWord(this.pc, operand.getAsSignedNumber());

        //console.log(`Offset: ${operand.getAsSignedNumber()}`);
    }

    jmp(byteLow: Byte, byteHigh: Byte) {
        this.pc.lowByte.setAsNumber(byteLow.byte);
        this.pc.highByte.setAsNumber(byteHigh.byte);
    }

    jsr(byteLow: Byte, byteHigh: Byte) {
        // pc is already incr by 3 through fetching
        // reduce by 1 for compatibility
        this.decrementWord(this.pc);

        this.pushOnStack(this.pc.highByte.byte);
        this.pushOnStack(this.pc.lowByte.byte);

        this.pc.lowByte.setAsNumber(byteLow.byte);
        this.pc.highByte.setAsNumber(byteHigh.byte);
    }

    rts() {
        this.pc.lowByte.setAsNumber(this.pullFromStack());
        this.pc.highByte.setAsNumber(this.pullFromStack());
        this.incrementWord(this.pc);
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

    incrementByte(byte: Byte) {
        let value = byte.byte;
        value++;
        const newValue = value % 256; // overflow
        byte.setAsNumber(newValue);

        // return true if overflow
        return value !== newValue ? true : false;
    }

    decrementByte(byte: Byte) {
        let value = byte.byte;
        value--;
        const newValue = value < 0 ? 256 - value : value; // underflow
        byte.setAsNumber(newValue);

        // return true if underflow
        return value !== newValue ? true : false;
    }

    incrementWord(word: Word) {
        const overflowLowByte = this.incrementByte(word.lowByte);
        if (overflowLowByte) {
            this.incrementByte(word.highByte);
        }
    }

    decrementWord(word: Word) {
        const underflowLowByte = this.decrementByte(word.lowByte);
        if (underflowLowByte) {
            this.decrementByte(word.highByte);
        }
    }

    addToByte(byte: Byte, value: number) {
        const result = byte.byte + value;
        if (result > 255) {
            byte.setAsNumber(result % 256);
            return 1;
        }
        if (result < 0) {
            byte.setAsNumber(256 - result);
            return -1;
        }

        byte.setAsNumber(result);
        return 0;
    }

    addToWord(word: Word, value: number) {
        const result = this.addToByte(word.lowByte, value);
        if (result !== 0) this.addToByte(word.highByte, result);
    }
}
