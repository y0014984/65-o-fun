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

            case '0xa2': // LDX #$nn
                this.ldxImmediate(this.fetchByte());
                break;

            case '0xa6': // LDX $ll
                this.ldxZeroPage(this.fetchByte());
                break;

            case '0xb6': // LDX $ll, Y
                this.ldxZeroPageY(this.fetchByte());
                break;

            case '0xae': // LDX $hhll
                this.ldxAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xbe': // LDX $hhll, Y
                this.ldxAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '0xa0': // LDY #$nn
                this.ldyImmediate(this.fetchByte());
                break;

            case '0xa4': // LDY $ll
                this.ldyZeroPage(this.fetchByte());
                break;

            case '0xb4': // LDY $ll, X
                this.ldyZeroPageX(this.fetchByte());
                break;

            case '0xac': // LDY $hhll
                this.ldyAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xbc': // LDY $hhll, X
                this.ldyAbsoluteX(this.fetchByte(), this.fetchByte());
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

            case '0xc6': // DEC $ll
                this.decZeroPage(this.fetchByte());
                break;

            case '0xd6': // DEC $ll, X
                this.decZeroPageX(this.fetchByte());
                break;

            case '0xce': // DEC $hhll
                this.decAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xde': // DEC $hhll, X
                this.decAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0xe8': // INX
                this.inx();
                break;

            case '0xc8': // INY
                this.iny();
                break;

            case '0xca': // DEX
                this.dex();
                break;

            case '0x88': // DEY
                this.dey();
                break;

            case '0x18': // CLC
                this.clc();
                break;

            case '0x38': // SEC
                this.sec();
                break;

            case '0x58': // CLI
                this.cli();
                break;

            case '0x78': // SEI
                this.sei();
                break;

            case '0xd8': // CLD
                this.cld();
                break;

            case '0xf8': // SED
                this.sed();
                break;

            case '0xb8': // CLV
                this.clv();
                break;

            case '0x69': // ADC #$nn
                this.adcImmediate(this.fetchByte());
                break;

            case '0x65': // ADC $ll
                this.adcZeroPage(this.fetchByte());
                break;

            case '0x75': // ADC $ll, X
                this.adcZeroPageX(this.fetchByte());
                break;

            case '0x6d': // ADC $hhll
                this.adcAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x7d': // ADC $hhll, X
                this.adcAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0x79': // ADC $hhll, Y
                this.adcAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '0x61': // ADC ($ll, X)
                this.adcIndexedIndirect(this.fetchByte());
                break;

            case '0x71': // ADC ($ll), Y
                this.adcIndirectIndexed(this.fetchByte());
                break;

            case '0xe9': // SBC #$nn
                this.sbcImmediate(this.fetchByte());
                break;

            case '0xe5': // SBC $ll
                this.sbcZeroPage(this.fetchByte());
                break;

            case '0xf5': // SBC $ll, X
                this.sbcZeroPageX(this.fetchByte());
                break;

            case '0xed': // SBC $hhll
                this.sbcAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xfd': // SBC $hhll, X
                this.sbcAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0xf9': // SBC $hhll, Y
                this.sbcAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '0xe1': // SBC ($ll, X)
                this.sbcIndexedIndirect(this.fetchByte());
                break;

            case '0xf1': // SBC ($ll), Y
                this.sbcIndirectIndexed(this.fetchByte());
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

            case '0xe0': // CPX #$nn
                this.cpxImmediate(this.fetchByte());
                break;

            case '0xe4': // CPX $ll
                this.cpxZeroPage(this.fetchByte());
                break;

            case '0xec': // CPX $hhll
                this.cpxAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xc0': // CPY #$nn
                this.cpyImmediate(this.fetchByte());
                break;

            case '0xc4': // CPY $ll
                this.cpyZeroPage(this.fetchByte());
                break;

            case '0xcc': // CPY $hhll
                this.cpyAbsolute(this.fetchByte(), this.fetchByte());
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

            case '0x48': // PHA
                this.pha();
                break;

            case '0x68': // PLA
                this.pla();
                break;

            case '0x08': // PHP
                this.php();
                break;

            case '0x28': // PLP
                this.plp();
                break;

            case '0xea': // NOP

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

    ldxImmediate(value: Byte) {
        this.x.setAsNumber(value.int);

        this.setArithmeticFlags();
    }

    ldxZeroPage(zpAddr: Byte) {
        this.x.setAsNumber(this.mem[zpAddr.int].int);

        this.setArithmeticFlags();
    }

    ldxZeroPageY(zpAddr: Byte) {
        this.x.setAsNumber(this.mem[zpAddr.int + this.y.int].int);

        this.setArithmeticFlags();
    }

    ldxAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.x.setAsNumber(this.mem[address.getAsNumber()].int);

        this.setArithmeticFlags();
    }

    ldxAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.x.setAsNumber(this.mem[address.getAsNumber() + this.y.int].int);

        this.setArithmeticFlags();
    }

    ldyImmediate(value: Byte) {
        this.y.setAsNumber(value.int);

        this.setArithmeticFlags();
    }

    ldyZeroPage(zpAddr: Byte) {
        this.y.setAsNumber(this.mem[zpAddr.int].int);

        this.setArithmeticFlags();
    }

    ldyZeroPageX(zpAddr: Byte) {
        this.y.setAsNumber(this.mem[zpAddr.int + this.x.int].int);

        this.setArithmeticFlags();
    }

    ldyAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.y.setAsNumber(this.mem[address.getAsNumber()].int);

        this.setArithmeticFlags();
    }

    ldyAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.y.setAsNumber(this.mem[address.getAsNumber() + this.x.int].int);

        this.setArithmeticFlags();
    }

    ldaIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int + this.x.int];
        const byteHigh: Byte = this.mem[zpAddr.int + this.x.int + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setAsNumber(this.mem[address.getAsNumber()].int);

        this.setArithmeticFlags();
    }

    ldaIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int];
        const byteHigh: Byte = this.mem[zpAddr.int + 1];

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

    staIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int + this.x.int];
        const byteHigh: Byte = this.mem[zpAddr.int + this.x.int + 1];

        const address = new Word(byteLow, byteHigh);

        this.mem[address.getAsNumber()].setAsNumber(this.a.int);
    }

    staIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int];
        const byteHigh: Byte = this.mem[zpAddr.int + 1];

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

    decZeroPage(zpAddr: Byte) {
        this.decrementByte(this.mem[zpAddr.int]);

        this.setArithmeticFlags();
    }

    decZeroPageX(zpAddr: Byte) {
        this.decrementByte(this.mem[zpAddr.int + this.x.int]);

        this.setArithmeticFlags();
    }

    decAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.decrementByte(this.mem[address.getAsNumber()]);

        this.setArithmeticFlags();
    }

    decAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.decrementByte(this.mem[address.getAsNumber() + this.x.int]);

        this.setArithmeticFlags();
    }

    inx() {
        this.incrementByte(this.x);
    }

    iny() {
        this.incrementByte(this.y);
    }

    dex() {
        this.decrementByte(this.x);
    }

    dey() {
        this.decrementByte(this.y);
    }

    clc() {
        this.p.setCarryFlag(false);
    }

    sec() {
        this.p.setCarryFlag(true);
    }

    cli() {
        this.p.setInterruptFlag(false);
    }

    sei() {
        this.p.setInterruptFlag(true);
    }

    cld() {
        this.p.setDecimalFlag(false);
    }

    sed() {
        this.p.setDecimalFlag(true);
    }

    clv() {
        this.p.setOverflowFlag(false);
    }

    adcImmediate(value: Byte) {
        const flags = this.addByteToAccumulator(value);

        this.setAddSubstractFlags(flags);
    }

    adcZeroPage(zpAddr: Byte) {
        const flags = this.addByteToAccumulator(this.mem[zpAddr.int]);

        this.setAddSubstractFlags(flags);
    }

    adcZeroPageX(zpAddr: Byte) {
        const flags = this.addByteToAccumulator(this.mem[zpAddr.int + this.x.int]);

        this.setAddSubstractFlags(flags);
    }

    adcAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getAsNumber()]);

        this.setAddSubstractFlags(flags);
    }

    adcAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getAsNumber() + this.x.int]);

        this.setAddSubstractFlags(flags);
    }

    adcAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getAsNumber() + this.y.int]);

        this.setAddSubstractFlags(flags);
    }

    adcIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int + this.x.int];
        const byteHigh: Byte = this.mem[zpAddr.int + this.x.int + 1];

        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getAsNumber()]);

        this.setAddSubstractFlags(flags);
    }

    adcIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int];
        const byteHigh: Byte = this.mem[zpAddr.int + 1];

        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getAsNumber() + this.y.int]);

        this.setAddSubstractFlags(flags);
    }

    sbcImmediate(value: Byte) {
        const flags = this.substractByteFromAccumulator(value);

        this.setAddSubstractFlags(flags);
    }

    sbcZeroPage(zpAddr: Byte) {
        const flags = this.substractByteFromAccumulator(this.mem[zpAddr.int]);

        this.setAddSubstractFlags(flags);
    }

    sbcZeroPageX(zpAddr: Byte) {
        const flags = this.substractByteFromAccumulator(this.mem[zpAddr.int + this.x.int]);

        this.setAddSubstractFlags(flags);
    }

    sbcAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getAsNumber()]);

        this.setAddSubstractFlags(flags);
    }

    sbcAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getAsNumber() + this.x.int]);

        this.setAddSubstractFlags(flags);
    }

    sbcAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getAsNumber() + this.y.int]);

        this.setAddSubstractFlags(flags);
    }

    sbcIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int + this.x.int];
        const byteHigh: Byte = this.mem[zpAddr.int + this.x.int + 1];

        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getAsNumber()]);

        this.setAddSubstractFlags(flags);
    }

    sbcIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int];
        const byteHigh: Byte = this.mem[zpAddr.int + 1];

        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getAsNumber() + this.y.int]);

        this.setAddSubstractFlags(flags);
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

    cmpIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int + this.x.int];
        const byteHigh: Byte = this.mem[zpAddr.int + this.x.int + 1];

        const address = new Word(byteLow, byteHigh);

        const result = this.a.int - this.mem[address.getAsNumber()].int;

        this.setCompareFlags(result);
    }

    cmpIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.int];
        const byteHigh: Byte = this.mem[zpAddr.int + 1];

        const address = new Word(byteLow, byteHigh);

        const result = this.a.int - this.mem[address.getAsNumber() + this.y.int].int;

        this.setCompareFlags(result);
    }

    cpxImmediate(operand: Byte) {
        const result = this.x.int - operand.int;

        this.setCompareFlags(result);
    }

    cpxZeroPage(zpAddr: Byte) {
        const result = this.x.int - this.mem[zpAddr.int].int;

        this.setCompareFlags(result);
    }

    cpxAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.x.int - this.mem[address.getAsNumber()].int;

        this.setCompareFlags(result);
    }

    cpyImmediate(operand: Byte) {
        const result = this.y.int - operand.int;

        this.setCompareFlags(result);
    }

    cpyZeroPage(zpAddr: Byte) {
        const result = this.y.int - this.mem[zpAddr.int].int;

        this.setCompareFlags(result);
    }

    cpyAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.y.int - this.mem[address.getAsNumber()].int;

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

    pha() {
        this.pushOnStack(this.a.int);
    }

    pla() {
        this.a.setAsNumber(this.pullFromStack());
    }

    php() {
        this.pushOnStack(this.p.int);
    }

    plp() {
        this.p.setAsNumber(this.pullFromStack());
    }

    /* === COMMAND HELPER === */

    setArithmeticFlags() {
        this.p.setNegativeFlag(this.a.int > 127);
        this.p.setZeroFlag(this.a.int === 0);
    }

    setAddSubstractFlags({ carry, overflow }: { carry: boolean; overflow: boolean }) {
        this.p.setCarryFlag(carry);
        this.p.setOverflowFlag(overflow);
        this.setArithmeticFlags();
    }

    setCompareFlags(result: number) {
        this.p.setNegativeFlag(result < 0);
        this.p.setZeroFlag(result === 0);
        this.p.setCarryFlag(result >= 0);
    }

    addByteToAccumulator(value: Byte) {
        const carryBit = this.p.getCarryFlag() ? 1 : 0;

        const result = this.a.int + value.int + carryBit;

        const resultSigned = this.a.getAsSignedNumber() + value.getAsSignedNumber() + carryBit;

        const carry = result > 255 ? true : false; // int overflow
        const overflow = resultSigned < -128 || resultSigned > 127 ? true : false; // signed int overflow

        this.a.setAsNumber(result);

        return { carry, overflow };
    }

    substractByteFromAccumulator(value: Byte) {
        const carryBit = this.p.getCarryFlag() ? 1 : 0;

        const result = this.a.int - value.int - 1 + carryBit;

        const resultSigned = this.a.getAsSignedNumber() - value.getAsSignedNumber() - 1 + carryBit;

        const carry = result >= 0 ? true : false; // true = no borrow; false = borrow
        const overflow = resultSigned < -128 || resultSigned > 127 ? true : false; // signed int overflow

        this.a.setAsNumber(result);

        return { carry, overflow };
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
        const newValue = value < 0 ? value + 256 : value; // underflow
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
