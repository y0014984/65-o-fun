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

            case '0x86': // STX $ll
                this.stxZeroPage(this.fetchByte());
                break;

            case '0x96': // STX $ll, Y
                this.stxZeroPageY(this.fetchByte());
                break;

            case '0x8e': // STX $hhll
                this.stxAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x84': // STY $ll
                this.styZeroPage(this.fetchByte());
                break;

            case '0x94': // STY $ll, X
                this.styZeroPageX(this.fetchByte());
                break;

            case '0x8c': // STY $hhll
                this.styAbsolute(this.fetchByte(), this.fetchByte());
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

            case '0x00': // BRK
                this.brk();
                break;

            case '0x40': // RTI
                this.rti();
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

            case '0xaa': // TAX
                this.tax();
                break;

            case '0xa8': // TAY
                this.tay();
                break;

            case '0xba': // TSX
                this.tsx();
                break;

            case '0x8a': // TXA
                this.txa();
                break;

            case '0x98': // TYA
                this.tya();
                break;

            case '0x9a': // TXS
                this.txs();
                break;

            case '0x29': // AND #$nn
                this.andImmediate(this.fetchByte());
                break;

            case '0x25': // AND $ll
                this.andZeroPage(this.fetchByte());
                break;

            case '0x35': // AND $ll, X
                this.andZeroPageX(this.fetchByte());
                break;

            case '0x2d': // AND $hhll
                this.andAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x3d': // AND $hhll, X
                this.andAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0x39': // AND $hhll, Y
                this.andAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '0x31': // AND ($ll, X)
                this.andIndexedIndirect(this.fetchByte());
                break;

            case '0x21': // AND ($ll), Y
                this.andIndirectIndexed(this.fetchByte());
                break;

            case '0x09': // ORA #$nn
                this.oraImmediate(this.fetchByte());
                break;

            case '0x05': // ORA $ll
                this.oraZeroPage(this.fetchByte());
                break;

            case '0x15': // ORA $ll, X
                this.oraZeroPageX(this.fetchByte());
                break;

            case '0x0d': // ORA $hhll
                this.oraAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x1d': // ORA $hhll, X
                this.oraAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0x19': // ORA $hhll, Y
                this.oraAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '0x01': // ORA ($ll, X)
                this.oraIndexedIndirect(this.fetchByte());
                break;

            case '0x11': // ORA ($ll), Y
                this.oraIndirectIndexed(this.fetchByte());
                break;

            case '0x49': // EOR #$nn
                this.eorImmediate(this.fetchByte());
                break;

            case '0x45': // EOR $ll
                this.eorZeroPage(this.fetchByte());
                break;

            case '0x55': // EOR $ll, X
                this.eorZeroPageX(this.fetchByte());
                break;

            case '0x4d': // EOR $hhll
                this.eorAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x5d': // EOR $hhll, X
                this.eorAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0x59': // EOR $hhll, Y
                this.eorAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '0x41': // EOR ($ll, X)
                this.eorIndexedIndirect(this.fetchByte());
                break;

            case '0x51': // EOR ($ll), Y
                this.eorIndirectIndexed(this.fetchByte());
                break;

            case '0x0a': // ASL Accumulator
                this.aslAccumulator();
                break;

            case '0x06': // ASL $ll
                this.aslZeroPage(this.fetchByte());
                break;

            case '0x16': // ASL $ll, X
                this.aslZeroPageX(this.fetchByte());
                break;

            case '0x0e': // ASL $hhll
                this.aslAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x1e': // ASL $hhll, X
                this.aslAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0x4a': // LSR Accumulator
                this.lsrAccumulator();
                break;

            case '0x46': // LSR $ll
                this.lsrZeroPage(this.fetchByte());
                break;

            case '0x56': // LSR $ll, X
                this.lsrZeroPageX(this.fetchByte());
                break;

            case '0x4e': // LSR $hhll
                this.lsrAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x5e': // LSR $hhll, X
                this.lsrAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0x2a': // ROL Accumulator
                this.rolAccumulator();
                break;

            case '0x26': // ROL $ll
                this.rolZeroPage(this.fetchByte());
                break;

            case '0x36': // ROL $ll, X
                this.rolZeroPageX(this.fetchByte());
                break;

            case '0x2e': // ROL $hhll
                this.rolAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x3e': // ROL $hhll, X
                this.rolAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0x6a': // ROR Accumulator
                this.rorAccumulator();
                break;

            case '0x66': // ROR $ll
                this.rorZeroPage(this.fetchByte());
                break;

            case '0x76': // ROR $ll, X
                this.rorZeroPageX(this.fetchByte());
                break;

            case '0x6e': // ROR $hhll
                this.rorAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0x7e': // ROR $hhll, X
                this.rorAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '0x24': // BIT $ll
                this.bitZeroPage(this.fetchByte());
                break;

            case '0x2c': // BIT $hhll
                this.bitAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '0xea': // NOP

            default:
                break;
        }
    }

    fetchInstruction() {
        this.ir.setInt(this.fetchByte().getInt());
    }

    fetchByte() {
        const offset = this.pc.getInt();
        this.incrementWord(this.pc);
        return this.mem[offset];
    }

    /* === COMMANDS === */

    ldaImmediate(value: Byte) {
        this.a.setInt(value.getInt());

        this.setArithmeticFlags(this.a);
    }

    ldaZeroPage(zpAddr: Byte) {
        this.a.setInt(this.mem[zpAddr.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    ldaZeroPageX(zpAddr: Byte) {
        this.a.setInt(this.mem[zpAddr.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    ldaAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    ldaAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem[address.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    ldaAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem[address.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    ldaIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt() + this.x.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + this.x.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    ldaIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem[address.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    ldxImmediate(value: Byte) {
        this.x.setInt(value.getInt());

        this.setArithmeticFlags(this.x);
    }

    ldxZeroPage(zpAddr: Byte) {
        this.x.setInt(this.mem[zpAddr.getInt()].getInt());

        this.setArithmeticFlags(this.x);
    }

    ldxZeroPageY(zpAddr: Byte) {
        this.x.setInt(this.mem[zpAddr.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.x);
    }

    ldxAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.x.setInt(this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.x);
    }

    ldxAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.x.setInt(this.mem[address.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.x);
    }

    ldyImmediate(value: Byte) {
        this.y.setInt(value.getInt());

        this.setArithmeticFlags(this.y);
    }

    ldyZeroPage(zpAddr: Byte) {
        this.y.setInt(this.mem[zpAddr.getInt()].getInt());

        this.setArithmeticFlags(this.y);
    }

    ldyZeroPageX(zpAddr: Byte) {
        this.y.setInt(this.mem[zpAddr.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.y);
    }

    ldyAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.y.setInt(this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.y);
    }

    ldyAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.y.setInt(this.mem[address.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.y);
    }

    staZeroPage(zpAddr: Byte) {
        this.mem[zpAddr.getInt()].setInt(this.a.getInt());
    }

    staZeroPageX(zpAddr: Byte) {
        this.mem[zpAddr.getInt() + this.x.getInt()].setInt(this.a.getInt());
    }

    staAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem[address.getInt()].setInt(this.a.getInt());
    }

    staAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem[address.getInt() + this.x.getInt()].setInt(this.a.getInt());
    }

    staAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem[address.getInt() + this.y.getInt()].setInt(this.a.getInt());
    }

    staIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt() + this.x.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + this.x.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.mem[address.getInt()].setInt(this.a.getInt());
    }

    staIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.mem[address.getInt() + this.y.getInt()].setInt(this.a.getInt());
    }

    stxZeroPage(zpAddr: Byte) {
        this.mem[zpAddr.getInt()].setInt(this.x.getInt());
    }

    stxZeroPageY(zpAddr: Byte) {
        this.mem[zpAddr.getInt() + this.y.getInt()].setInt(this.x.getInt());
    }

    stxAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem[address.getInt()].setInt(this.x.getInt());
    }

    styZeroPage(zpAddr: Byte) {
        this.mem[zpAddr.getInt()].setInt(this.y.getInt());
    }

    styZeroPageX(zpAddr: Byte) {
        this.mem[zpAddr.getInt() + this.x.getInt()].setInt(this.y.getInt());
    }

    styAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem[address.getInt()].setInt(this.y.getInt());
    }

    incZeroPage(zpAddr: Byte) {
        this.incrementByte(this.mem[zpAddr.getInt()]);

        this.setArithmeticFlags(this.mem[zpAddr.getInt()]);
    }

    incZeroPageX(zpAddr: Byte) {
        this.incrementByte(this.mem[zpAddr.getInt() + this.x.getInt()]);

        this.setArithmeticFlags(this.mem[zpAddr.getInt() + this.x.getInt()]);
    }

    incAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.incrementByte(this.mem[address.getInt()]);

        this.setArithmeticFlags(this.mem[address.getInt()]);
    }

    incAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.incrementByte(this.mem[address.getInt() + this.x.getInt()]);

        this.setArithmeticFlags(this.mem[address.getInt() + this.x.getInt()]);
    }

    decZeroPage(zpAddr: Byte) {
        this.decrementByte(this.mem[zpAddr.getInt()]);

        this.setArithmeticFlags(this.mem[zpAddr.getInt()]);
    }

    decZeroPageX(zpAddr: Byte) {
        this.decrementByte(this.mem[zpAddr.getInt() + this.x.getInt()]);

        this.setArithmeticFlags(this.mem[zpAddr.getInt() + this.x.getInt()]);
    }

    decAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.decrementByte(this.mem[address.getInt()]);

        this.setArithmeticFlags(this.mem[address.getInt()]);
    }

    decAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.decrementByte(this.mem[address.getInt() + this.x.getInt()]);

        this.setArithmeticFlags(this.mem[address.getInt() + this.x.getInt()]);
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
        const flags = this.addByteToAccumulator(this.mem[zpAddr.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    adcZeroPageX(zpAddr: Byte) {
        const flags = this.addByteToAccumulator(this.mem[zpAddr.getInt() + this.x.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    adcAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    adcAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getInt() + this.x.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    adcAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getInt() + this.y.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    adcIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt() + this.x.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + this.x.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    adcIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem[address.getInt() + this.y.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    sbcImmediate(value: Byte) {
        const flags = this.substractByteFromAccumulator(value);

        this.setAddSubstractFlags(flags);
    }

    sbcZeroPage(zpAddr: Byte) {
        const flags = this.substractByteFromAccumulator(this.mem[zpAddr.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    sbcZeroPageX(zpAddr: Byte) {
        const flags = this.substractByteFromAccumulator(this.mem[zpAddr.getInt() + this.x.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    sbcAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    sbcAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getInt() + this.x.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    sbcAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getInt() + this.y.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    sbcIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt() + this.x.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + this.x.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    sbcIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem[address.getInt() + this.y.getInt()]);

        this.setAddSubstractFlags(flags);
    }

    cmpImmediate(operand: Byte) {
        const result = this.a.getInt() - operand.getInt();

        this.setCompareFlags(result);
    }

    cmpZeroPage(zpAddr: Byte) {
        const result = this.a.getInt() - this.mem[zpAddr.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cmpZeroPageX(zpAddr: Byte) {
        const result = this.a.getInt() - this.mem[zpAddr.getInt() + this.x.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cmpAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.a.getInt() - this.mem[address.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cmpAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.a.getInt() - this.mem[address.getInt() + this.x.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cmpAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.a.getInt() - this.mem[address.getInt() + this.y.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cmpIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt() + this.x.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + this.x.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        const result = this.a.getInt() - this.mem[address.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cmpIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        const result = this.a.getInt() - this.mem[address.getInt() + this.y.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cpxImmediate(operand: Byte) {
        const result = this.x.getInt() - operand.getInt();

        this.setCompareFlags(result);
    }

    cpxZeroPage(zpAddr: Byte) {
        const result = this.x.getInt() - this.mem[zpAddr.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cpxAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.x.getInt() - this.mem[address.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cpyImmediate(operand: Byte) {
        const result = this.y.getInt() - operand.getInt();

        this.setCompareFlags(result);
    }

    cpyZeroPage(zpAddr: Byte) {
        const result = this.y.getInt() - this.mem[zpAddr.getInt()].getInt();

        this.setCompareFlags(result);
    }

    cpyAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const result = this.y.getInt() - this.mem[address.getInt()].getInt();

        this.setCompareFlags(result);
    }

    bpl(operand: Byte) {
        if (!this.p.getNegativeFlag()) {
            this.addToWord(this.pc, operand.getAsSignedInt());
        }
    }

    bmi(operand: Byte) {
        if (this.p.getNegativeFlag()) {
            this.addToWord(this.pc, operand.getAsSignedInt());
        }
    }

    bvc(operand: Byte) {
        if (!this.p.getCarryFlag()) {
            this.addToWord(this.pc, operand.getAsSignedInt());
        }
    }

    bvs(operand: Byte) {
        if (this.p.getCarryFlag()) {
            this.addToWord(this.pc, operand.getAsSignedInt());
        }
    }

    bcc(operand: Byte) {
        if (!this.p.getCarryFlag()) {
            this.addToWord(this.pc, operand.getAsSignedInt());
        }
    }

    bcs(operand: Byte) {
        if (this.p.getCarryFlag()) {
            this.addToWord(this.pc, operand.getAsSignedInt());
        }
    }

    bne(operand: Byte) {
        if (!this.p.getZeroFlag()) {
            this.addToWord(this.pc, operand.getAsSignedInt());
        }
    }

    beq(operand: Byte) {
        if (this.p.getZeroFlag()) {
            this.addToWord(this.pc, operand.getAsSignedInt());
        }
    }

    jmp(byteLow: Byte, byteHigh: Byte) {
        this.pc.lowByte.setInt(byteLow.getInt());
        this.pc.highByte.setInt(byteHigh.getInt());
    }

    jmpIndirect(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.pc.lowByte.setInt(this.mem[address.getInt()].getInt());
        this.pc.highByte.setInt(this.mem[address.getInt() + 1].getInt());
    }

    brk() {
        // pc is already incr by 3 through fetching
        // reduce by 1 for compatibility
        this.decrementWord(this.pc);

        this.pushOnStack(this.pc.highByte.getInt());
        this.pushOnStack(this.pc.lowByte.getInt());

        this.pushOnStack(this.p.getInt());

        this.pc.lowByte.setInt(this.mem[parseInt('fffe', 16)].getInt());
        this.pc.highByte.setInt(this.mem[parseInt('ffff', 16)].getInt());
    }

    rti() {
        this.p.setInt(this.pullFromStack());
        this.pc.lowByte.setInt(this.pullFromStack());
        this.pc.highByte.setInt(this.pullFromStack());
    }

    jsr(byteLow: Byte, byteHigh: Byte) {
        // pc is already incr by 3 through fetching
        // reduce by 1 for compatibility
        this.decrementWord(this.pc);

        this.pushOnStack(this.pc.highByte.getInt());
        this.pushOnStack(this.pc.lowByte.getInt());

        this.pc.lowByte.setInt(byteLow.getInt());
        this.pc.highByte.setInt(byteHigh.getInt());
    }

    rts() {
        this.pc.lowByte.setInt(this.pullFromStack());
        this.pc.highByte.setInt(this.pullFromStack());
        this.incrementWord(this.pc);
    }

    pha() {
        this.pushOnStack(this.a.getInt());
    }

    pla() {
        this.a.setInt(this.pullFromStack());
        this.setArithmeticFlags(this.a);
    }

    php() {
        this.pushOnStack(this.p.getInt());
    }

    plp() {
        this.p.setInt(this.pullFromStack());
    }

    tax() {
        this.x.setInt(this.a.getInt());
        this.setArithmeticFlags(this.x);
    }

    tay() {
        this.y.setInt(this.a.getInt());
        this.setArithmeticFlags(this.y);
    }

    tsx() {
        this.x.setInt(this.s.getInt());
        this.setArithmeticFlags(this.x);
    }

    txa() {
        this.a.setInt(this.x.getInt());
        this.setArithmeticFlags(this.a);
    }

    tya() {
        this.a.setInt(this.y.getInt());
        this.setArithmeticFlags(this.a);
    }

    txs() {
        this.s.setInt(this.x.getInt());
    }

    andImmediate(value: Byte) {
        this.a.setInt(this.a.getInt() & value.getInt());

        this.setArithmeticFlags(this.a);
    }

    andZeroPage(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() & this.mem[zpAddr.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    andZeroPageX(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() & this.mem[zpAddr.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    andAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    andAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem[address.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    andAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem[address.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    andIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt() + this.x.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + this.x.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    andIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem[address.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    oraImmediate(value: Byte) {
        this.a.setInt(this.a.getInt() | value.getInt());

        this.setArithmeticFlags(this.a);
    }

    oraZeroPage(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() | this.mem[zpAddr.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    oraZeroPageX(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() | this.mem[zpAddr.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    oraAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    oraAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem[address.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    oraAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem[address.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    oraIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt() + this.x.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + this.x.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    oraIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem[address.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    eorImmediate(value: Byte) {
        this.a.setInt(this.a.getInt() ^ value.getInt());

        this.setArithmeticFlags(this.a);
    }

    eorZeroPage(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() ^ this.mem[zpAddr.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    eorZeroPageX(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() ^ this.mem[zpAddr.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    eorAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    eorAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem[address.getInt() + this.x.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    eorAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem[address.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    eorIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt() + this.x.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + this.x.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem[address.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    eorIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem[zpAddr.getInt()];
        const byteHigh: Byte = this.mem[zpAddr.getInt() + 1];

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem[address.getInt() + this.y.getInt()].getInt());

        this.setArithmeticFlags(this.a);
    }

    aslAccumulator() {
        const carry = this.shiftLeftByte(this.a);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a);
    }

    aslZeroPage(zpAddr: Byte) {
        const carry = this.shiftLeftByte(this.mem[zpAddr.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[zpAddr.getInt()]);
    }

    aslZeroPageX(zpAddr: Byte) {
        const carry = this.shiftLeftByte(this.mem[zpAddr.getInt() + this.x.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[zpAddr.getInt() + this.x.getInt()]);
    }

    aslAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.shiftLeftByte(this.mem[address.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[address.getInt()]);
    }

    aslAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.shiftLeftByte(this.mem[address.getInt() + this.x.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[address.getInt() + this.x.getInt()]);
    }

    lsrAccumulator() {
        const carry = this.shiftRightByte(this.a);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a);
    }

    lsrZeroPage(zpAddr: Byte) {
        const carry = this.shiftRightByte(this.mem[zpAddr.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[zpAddr.getInt()]);
    }

    lsrZeroPageX(zpAddr: Byte) {
        const carry = this.shiftRightByte(this.mem[zpAddr.getInt() + this.x.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[zpAddr.getInt() + this.x.getInt()]);
    }

    lsrAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.shiftRightByte(this.mem[address.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[address.getInt()]);
    }

    lsrAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.shiftRightByte(this.mem[address.getInt() + this.x.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[address.getInt() + this.x.getInt()]);
    }

    rolAccumulator() {
        const carry = this.rotateLeftByte(this.a);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a);
    }

    rolZeroPage(zpAddr: Byte) {
        const carry = this.rotateLeftByte(this.mem[zpAddr.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[zpAddr.getInt()]);
    }

    rolZeroPageX(zpAddr: Byte) {
        const carry = this.rotateLeftByte(this.mem[zpAddr.getInt() + this.x.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[zpAddr.getInt() + this.x.getInt()]);
    }

    rolAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.rotateLeftByte(this.mem[address.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[address.getInt()]);
    }

    rolAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.rotateLeftByte(this.mem[address.getInt() + this.x.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[address.getInt() + this.x.getInt()]);
    }

    rorAccumulator() {
        const carry = this.rotateRightByte(this.a);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a);
    }

    rorZeroPage(zpAddr: Byte) {
        const carry = this.rotateRightByte(this.mem[zpAddr.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[zpAddr.getInt()]);
    }

    rorZeroPageX(zpAddr: Byte) {
        const carry = this.rotateRightByte(this.mem[zpAddr.getInt() + this.x.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[zpAddr.getInt() + this.x.getInt()]);
    }

    rorAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.rotateRightByte(this.mem[address.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[address.getInt()]);
    }

    rorAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.rotateRightByte(this.mem[address.getInt() + this.x.getInt()]);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem[address.getInt() + this.x.getInt()]);
    }

    bitZeroPage(zpAddr: Byte) {
        this.p.setNegativeFlag(this.mem[zpAddr.getInt()].getBitByIndex(7));
        this.p.setOverflowFlag(this.mem[zpAddr.getInt()].getBitByIndex(6));

        this.p.setZeroFlag((this.a.getInt() & this.mem[zpAddr.getInt()].getInt()) === 0 ? true : false);
    }

    bitAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.p.setNegativeFlag(this.mem[address.getInt()].getBitByIndex(7));
        this.p.setOverflowFlag(this.mem[address.getInt()].getBitByIndex(6));

        this.p.setZeroFlag((this.a.getInt() & this.mem[address.getInt()].getInt()) === 0 ? true : false);
    }

    /* === COMMAND HELPER === */

    setArithmeticFlags(byte: Byte) {
        this.p.setNegativeFlag(byte.getInt() > 127);
        this.p.setZeroFlag(byte.getInt() === 0);
    }

    setAddSubstractFlags({ carry, overflow }: { carry: boolean; overflow: boolean }) {
        this.p.setCarryFlag(carry);
        this.p.setOverflowFlag(overflow);
        this.setArithmeticFlags(this.p);
    }

    setCompareFlags(result: number) {
        this.p.setNegativeFlag(result < 0);
        this.p.setZeroFlag(result === 0);
        this.p.setCarryFlag(result >= 0);
    }

    shiftLeftByte(byte: Byte) {
        // C-B-B-B-B-B-B-B-0 <<
        const newBitsWithCarry = (byte.getInt() << 1).toString(2).slice(-9).padStart(9, '0');
        const carry = newBitsWithCarry[0] === '1' ? true : false;
        const newValue = parseInt(newBitsWithCarry.substring(1, 9), 2);

        byte.setInt(newValue);

        return carry;
    }

    shiftRightByte(byte: Byte) {
        // >> 0-B-B-B-B-B-B-B-C
        const newBitsWithCarry = ((byte.getInt() << 1) >>> 1).toString(2).slice(-9).padStart(9, '0');
        const carry = newBitsWithCarry[8] === '1' ? true : false;
        const newValue = parseInt(newBitsWithCarry.substring(0, 8), 2);

        byte.setInt(newValue);

        return carry;
    }

    rotateLeftByte(byte: Byte) {
        // (new)C-B-B-B-B-B-B-B-B-C(old) <<
        const carry = this.p.getCarryFlag() ? '1' : '0';
        const value = byte.getInt().toString();
        const bitsWithCarry = `${value}${carry}`;
        const newBitsWithCarry = (parseInt(bitsWithCarry) << 1).toString(2);
        const newCarry = newBitsWithCarry[0] === '1' ? true : false;
        const newValue = parseInt(newBitsWithCarry.substring(1, 9), 2);

        byte.setInt(newValue);

        return newCarry;
    }

    rotateRightByte(byte: Byte) {
        // >> (old)C-B-B-B-B-B-B-B-B-C(new)
        const carry = this.p.getCarryFlag() ? '1' : '0';
        const value = byte.getInt().toString();
        const bitsWithCarry = `${carry}${value}`;
        const newBitsWithCarry = ((parseInt(bitsWithCarry) << 1) >>> 1).toString(2);
        const newCarry = newBitsWithCarry[8] === '1' ? true : false;
        const newValue = parseInt(newBitsWithCarry.substring(0, 8), 2);

        byte.setInt(newValue);

        return newCarry;
    }

    addByteToAccumulator(value: Byte) {
        const carryBit = this.p.getCarryFlag() ? 1 : 0;

        const result = this.a.getInt() + value.getInt() + carryBit;

        const resultSigned = this.a.getAsSignedInt() + value.getAsSignedInt() + carryBit;

        const carry = result > 255 ? true : false; // int overflow
        const overflow = resultSigned < -128 || resultSigned > 127 ? true : false; // signed int overflow

        this.a.setInt(result);

        return { carry, overflow };
    }

    substractByteFromAccumulator(value: Byte) {
        const carryBit = this.p.getCarryFlag() ? 1 : 0;

        const result = this.a.getInt() - value.getInt() - 1 + carryBit;

        const resultSigned = this.a.getAsSignedInt() - value.getAsSignedInt() - 1 + carryBit;

        const carry = result >= 0 ? true : false; // true = no borrow; false = borrow
        const overflow = resultSigned < -128 || resultSigned > 127 ? true : false; // signed int overflow

        this.a.setInt(result);

        return { carry, overflow };
    }

    pushOnStack(value: number) {
        this.mem[255 + this.s.getInt()].setInt(value);
        this.decrementByte(this.s);
    }

    pullFromStack() {
        this.incrementByte(this.s);
        return this.mem[255 + this.s.getInt()].getInt();
    }

    incrementByte(byte: Byte) {
        let value = byte.getInt();
        value++;
        const newValue = value % 256; // overflow
        byte.setInt(newValue);

        // return true if overflow
        return value !== newValue ? true : false;
    }

    decrementByte(byte: Byte) {
        let value = byte.getInt();
        value--;
        const newValue = value < 0 ? value + 256 : value; // underflow
        byte.setInt(newValue);

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
        const result = byte.getInt() + value;
        if (result > 255) {
            byte.setInt(result % 256);
            return 1;
        }
        if (result < 0) {
            byte.setInt(256 - result);
            return -1;
        }

        byte.setInt(result);
        return 0;
    }

    addToWord(word: Word, value: number) {
        const result = this.addToByte(word.lowByte, value);
        if (result !== 0) this.addToByte(word.highByte, result);
    }
}
