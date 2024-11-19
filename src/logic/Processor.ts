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
            case '0xa9': // LDA #$nn
                this.ldaImmediate(this.fetchByte());
                break;

            case '0xa5': // LDA $ll
                this.ldaZeroPage(this.fetchByte());
                break;

            case '0xb5': // LDA $ll, X
                this.ldaZeroPageIndexedX(this.fetchByte());
                break;

            case '0xad': // LDA $hhll
                this.ldaAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xbd': // LDA $hhll, X
                this.ldaAbsoluteIndexedX(this.fetchByte(), this.fetchByte());
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

            case '0x10': // BPL
                this.bpl(this.fetchByte());
                break;

            case '0x30': // BMI
                this.bmi(this.fetchByte());
                break;

            case '0x50': // BVC
                this.bvc(this.fetchByte());
                break;

            case '0x70': // BVS
                this.bvs(this.fetchByte());
                break;

            case '0x90': // BCC
                this.bcc(this.fetchByte());
                break;

            case '0xb0': // BCS
                this.bcs(this.fetchByte());
                break;

            case '0xd0': // BNE
                this.bne(this.fetchByte());
                break;

            case '0xf0': // BEQ
                this.beq(this.fetchByte());
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
        this.ir.setAsNumber(this.fetchByte().int);
    }

    fetchByte() {
        const offset = this.pc.getAsNumber();
        this.incrementWord(this.pc);
        return this.mem[offset];
    }

    /* === COMMANDS === */

    ldaImmediate(value: Byte) {
        this.a.setAsNumber(value.int);

        this.setArithmeticFlags();
    }

    ldaZeroPage(zpAddr: Byte) {
        this.a.setAsNumber(this.mem[zpAddr.int].int);

        this.setArithmeticFlags();
    }

    ldaZeroPageIndexedX(zpAddr: Byte) {
        this.a.setAsNumber(this.mem[zpAddr.int + this.x.int].int);

        this.setArithmeticFlags();
    }

    ldaAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setAsNumber(this.mem[address.getAsNumber()].int);

        this.setArithmeticFlags();
    }

    ldaAbsoluteIndexedX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setAsNumber(this.mem[address.getAsNumber() + this.x.int].int);

        this.setArithmeticFlags();
    }

    staZeroPage(zpAddr: Byte) {
        this.mem[zpAddr.int].setAsNumber(this.a.int);
    }

    incZeroPage(zpAddr: Byte) {
        this.incrementByte(this.mem[zpAddr.int]);

        this.setArithmeticFlags();
    }

    cmpImmediate(operand: Byte) {
        const result = this.a.int - operand.int;

        this.p.setNegativeFlag(result < 0);
        this.p.setZeroFlag(result === 0);
        this.p.setCarryFlag(result >= 0);
    }

    bpl(operand: Byte) {
        if (!this.p.getNegativeFlag()) {
            this.addToWord(this.pc, operand.getAsSignedNumber());
        }
    }

    bmi(operand: Byte) {
        if (this.p.getNegativeFlag()) {
            this.addToWord(this.pc, operand.getAsSignedNumber());
        }
    }

    bvc(operand: Byte) {
        if (!this.p.getCarryFlag()) {
            this.addToWord(this.pc, operand.getAsSignedNumber());
        }
    }

    bvs(operand: Byte) {
        if (this.p.getCarryFlag()) {
            this.addToWord(this.pc, operand.getAsSignedNumber());
        }
    }

    bcc(operand: Byte) {
        if (!this.p.getCarryFlag()) {
            this.addToWord(this.pc, operand.getAsSignedNumber());
        }
    }

    bcs(operand: Byte) {
        if (this.p.getCarryFlag()) {
            this.addToWord(this.pc, operand.getAsSignedNumber());
        }
    }

    bne(operand: Byte) {
        if (!this.p.getZeroFlag()) {
            this.addToWord(this.pc, operand.getAsSignedNumber());
        }
    }

    beq(operand: Byte) {
        if (this.p.getZeroFlag()) {
            this.addToWord(this.pc, operand.getAsSignedNumber());
        }
    }

    jmp(byteLow: Byte, byteHigh: Byte) {
        this.pc.lowByte.setAsNumber(byteLow.int);
        this.pc.highByte.setAsNumber(byteHigh.int);
    }

    jsr(byteLow: Byte, byteHigh: Byte) {
        // pc is already incr by 3 through fetching
        // reduce by 1 for compatibility
        this.decrementWord(this.pc);

        this.pushOnStack(this.pc.highByte.int);
        this.pushOnStack(this.pc.lowByte.int);

        this.pc.lowByte.setAsNumber(byteLow.int);
        this.pc.highByte.setAsNumber(byteHigh.int);
    }

    rts() {
        this.pc.lowByte.setAsNumber(this.pullFromStack());
        this.pc.highByte.setAsNumber(this.pullFromStack());
        this.incrementWord(this.pc);
    }

    /* === COMMAND HELPER === */

    setArithmeticFlags() {
        this.p.setNegativeFlag(this.a.int > 127);
        this.p.setZeroFlag(this.a.int === 0);
    }

    pushOnStack(value: number) {
        this.mem[255 + this.s.int].setAsNumber(value);
        this.decrementByte(this.s);
    }

    pullFromStack() {
        this.incrementByte(this.s);
        return this.mem[255 + this.s.int].int;
    }

    incrementByte(byte: Byte) {
        let value = byte.int;
        value++;
        const newValue = value % 256; // overflow
        byte.setAsNumber(newValue);

        // return true if overflow
        return value !== newValue ? true : false;
    }

    decrementByte(byte: Byte) {
        let value = byte.int;
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
        const result = byte.int + value;
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
