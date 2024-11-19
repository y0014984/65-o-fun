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
                this.ldaZeroPageX(this.fetchByte());
                break;

            case '0xad': // LDA $hhll
                this.ldaAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xbd': // LDA $hhll, X
                this.ldaAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0xb9': // LDA $hhll, Y
                this.ldaAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '0xa1': // LDA ($ll, X)
                this.ldaIndexedIndirect(this.fetchByte());
                break;

            case '0xb1': // LDA ($ll), Y
                this.ldaIndirectIndexed(this.fetchByte());
                break;

            case '0x85': // STA $ll
                this.staZeroPage(this.fetchByte());
                break;

            case '0x95': // STA $ll, X
                this.staZeroPageX(this.fetchByte());
                break;

            case '0x8d': // STA $hhll
                this.staAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x9d': // STA $hhll, X
                this.staAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0x99': // STA $hhll, Y
                this.staAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '0x81': // STA ($ll, X)
                this.staIndexedIndirect(this.fetchByte());
                break;

            case '0x91': // STA ($ll), Y
                this.staIndirectIndexed(this.fetchByte());
                break;

            case '0xe6': // INC $ll
                this.incZeroPage(this.fetchByte());
                break;

            case '0xf6': // INC $ll, X
                this.incZeroPageX(this.fetchByte());
                break;

            case '0xee': // INC $hhll
                this.incAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xfe': // INC $hhll, X
                this.incAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0xc9': // CMP #$nn
                this.cmpImmediate(this.fetchByte());
                break;

            case '0xc5': // CMP $ll
                this.cmpZeroPage(this.fetchByte());
                break;

            case '0xd5': // CMP $ll, X
                this.cmpZeroPageX(this.fetchByte());
                break;

            case '0xcd': // CMP $hhll
                this.cmpAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xdd': // CMP $hhll, X
                this.cmpAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0xd9': // CMP $hhll, Y
                this.cmpAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '0xc1': // CMP ($ll, X)
                this.cmpIndexedIndirect(this.fetchByte());
                break;

            case '0xd1': // CMP ($ll), Y
                this.cmpIndirectIndexed(this.fetchByte());
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

            case '0x4c': // JMP $hhll
                this.jmp(this.fetchByte(), this.fetchByte());
                break;

            case '0x6c': // JMP ($hhll)
                this.jmpIndirect(this.fetchByte(), this.fetchByte());
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

    ldaZeroPageX(zpAddr: Byte) {
        this.a.setAsNumber(this.mem[zpAddr.int + this.x.int].int);

        this.setArithmeticFlags();
    }

    ldaAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setAsNumber(this.mem[address.getAsNumber()].int);

        this.setArithmeticFlags();
    }

    ldaAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setAsNumber(this.mem[address.getAsNumber() + this.x.int].int);

        this.setArithmeticFlags();
    }

    ldaAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setAsNumber(this.mem[address.getAsNumber() + this.y.int].int);

        this.setArithmeticFlags();
    }

    ldaIndexedIndirect(value: Byte) {
        const byteLow: Byte = this.mem[value.int + this.x.int];
        const byteHigh: Byte = this.mem[value.int + this.x.int + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setAsNumber(this.mem[address.getAsNumber()].int);

        this.setArithmeticFlags();
    }

    ldaIndirectIndexed(value: Byte) {
        const byteLow: Byte = this.mem[value.int];
        const byteHigh: Byte = this.mem[value.int + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setAsNumber(this.mem[address.getAsNumber() + this.y.int].int);

        this.setArithmeticFlags();
    }

    staZeroPage(zpAddr: Byte) {
        this.mem[zpAddr.int].setAsNumber(this.a.int);
    }

    staZeroPageX(zpAddr: Byte) {
        this.mem[zpAddr.int + this.x.int].setAsNumber(this.a.int);
    }

    staAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem[address.getAsNumber()].setAsNumber(this.a.int);
    }

    staAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem[address.getAsNumber() + this.x.int].setAsNumber(this.a.int);
    }

    staAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem[address.getAsNumber() + this.y.int].setAsNumber(this.a.int);
    }

    staIndexedIndirect(value: Byte) {
        const byteLow: Byte = this.mem[value.int + this.x.int];
        const byteHigh: Byte = this.mem[value.int + this.x.int + 1];

        const address = new Word(byteLow, byteHigh);

        this.mem[address.getAsNumber()].setAsNumber(this.a.int);
    }

    staIndirectIndexed(value: Byte) {
        const byteLow: Byte = this.mem[value.int];
        const byteHigh: Byte = this.mem[value.int + 1];

        const address = new Word(byteLow, byteHigh);

        this.mem[address.getAsNumber() + this.y.int].setAsNumber(this.a.int);
    }

    incZeroPage(zpAddr: Byte) {
        this.incrementByte(this.mem[zpAddr.int]);

        this.setArithmeticFlags();
    }

    incZeroPageX(zpAddr: Byte) {
        this.incrementByte(this.mem[zpAddr.int + this.x.int]);

        this.setArithmeticFlags();
    }

    incAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.incrementByte(this.mem[address.getAsNumber()]);

        this.setArithmeticFlags();
    }

    incAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.incrementByte(this.mem[address.getAsNumber() + this.x.int]);

        this.setArithmeticFlags();
    }

    cmpImmediate(operand: Byte) {
        const result = this.a.int - operand.int;

        this.setCompareFlags(result);
    }

    cmpZeroPage(zpAddr: Byte) {
        const result = this.a.int - this.mem[zpAddr.int].int;

        this.setCompareFlags(result);
    }

    cmpZeroPageX(zpAddr: Byte) {
        const result = this.a.int - this.mem[zpAddr.int + this.x.int].int;

        this.setCompareFlags(result);
    }

    cmpAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.a.int - this.mem[address.getAsNumber()].int;

        this.setCompareFlags(result);
    }

    cmpAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.a.int - this.mem[address.getAsNumber() + this.x.int].int;

        this.setCompareFlags(result);
    }

    cmpAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.a.int - this.mem[address.getAsNumber() + this.y.int].int;

        this.setCompareFlags(result);
    }

    cmpIndexedIndirect(value: Byte) {
        const byteLow: Byte = this.mem[value.int + this.x.int];
        const byteHigh: Byte = this.mem[value.int + this.x.int + 1];

        const address = new Word(byteLow, byteHigh);

        const result = this.a.int - this.mem[address.getAsNumber()].int;

        this.setCompareFlags(result);
    }

    cmpIndirectIndexed(value: Byte) {
        const byteLow: Byte = this.mem[value.int];
        const byteHigh: Byte = this.mem[value.int + 1];

        const address = new Word(byteLow, byteHigh);

        const result = this.a.int - this.mem[address.getAsNumber() + this.y.int].int;

        this.setCompareFlags(result);
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

    jmpIndirect(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.pc.lowByte.setAsNumber(this.mem[address.getAsNumber()].int);
        this.pc.highByte.setAsNumber(this.mem[address.getAsNumber() + 1].int);
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

    setCompareFlags(result: number) {
        this.p.setNegativeFlag(result < 0);
        this.p.setZeroFlag(result === 0);
        this.p.setCarryFlag(result >= 0);
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
