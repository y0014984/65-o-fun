import Byte from './Byte';
import ProcessorStatusRegister from './ProcessorStatusRegister';
import Word from './Word';
import { references } from './Reference';
import Graphics from './Graphics';
import Memory from './Memory';

export default class Processor {
    mem: Memory;
    ir: Byte = new Byte(); // Instruction Register (1 Byte)
    a: Byte = new Byte(); // Accumulator Register (1 Byte)
    x: Byte = new Byte(); // Index Register X (1 Byte)
    y: Byte = new Byte(); // Index Register Y (1 Byte)
    s: Byte = new Byte(); // Stack Pointer Register (1 Byte)
    p: ProcessorStatusRegister = new ProcessorStatusRegister(); // Processor Status Register (1 Byte)
    pc: Word = new Word(); // Programm Counter Register (2 Bytes)
    cycleCounter: number = 0;
    instructionCounter: number = 0;
    executionTimeLastInstruction: number = 0;
    graphics: Graphics | null = null;
    brkReached: boolean = false;
    isWindowAvailable: boolean;

    constructor(memory: Memory) {
        this.mem = memory;

        this.initRegisters();

        this.isWindowAvailable = typeof window !== 'undefined';
    }

    initRegisters() {
        this.ir.setAsHexString('00');
        this.a.setAsHexString('00');
        this.x.setAsHexString('00');
        this.y.setAsHexString('00');
        this.s.setAsHexString('FF');
        this.p.setAsHexString('00');
        this.p.initRegister();
        this.pc.setAsHexString('00', '00');
    }

    reset() {
        this.initRegisters();
        this.cycleCounter = 0;
        this.instructionCounter = 0;
    }

    processInstruction() {
        let startTime = 0;
        if (this.isWindowAvailable) startTime = window.performance.now();

        if (!references.get(this.ir.getAsHexString())) {
            console.log(
                `Instruction not found: ${this.ir.getAsHexString()} PC: ${this.pc.int[0].toString(16).toUpperCase().padStart(4, '0')}`
            );
            // illegal opcode? or any other execution problem?
            this.fetchInstruction();
            return;
        }
        // TODO: Performance issue
        this.instructionCounter++;
        this.cycleCounter = this.cycleCounter + references.get(this.ir.getAsHexString()).cycles;

        this.fetchInstruction();

        switch (this.ir.int[0]) {
            case 0xa9: // LDA #$nn
                this.ldaImmediate(this.fetchByte());
                break;

            case 0xa5: // LDA $ll
                this.ldaZeroPage(this.fetchByte());
                break;

            case 0xb5: // LDA $ll, X
                this.ldaZeroPageX(this.fetchByte());
                break;

            case 0xad: // LDA $hhll
                this.ldaAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xbd: // LDA $hhll, X
                this.ldaAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0xb9: // LDA $hhll, Y
                this.ldaAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 0xa1: // LDA ($ll, X)
                this.ldaIndexedIndirect(this.fetchByte());
                break;

            case 0xb1: // LDA ($ll), Y
                this.ldaIndirectIndexed(this.fetchByte());
                break;

            case 0xa2: // LDX #$nn
                this.ldxImmediate(this.fetchByte());
                break;

            case 0xa6: // LDX $ll
                this.ldxZeroPage(this.fetchByte());
                break;

            case 0xb6: // LDX $ll, Y
                this.ldxZeroPageY(this.fetchByte());
                break;

            case 0xae: // LDX $hhll
                this.ldxAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xbe: // LDX $hhll, Y
                this.ldxAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 0xa0: // LDY #$nn
                this.ldyImmediate(this.fetchByte());
                break;

            case 0xa4: // LDY $ll
                this.ldyZeroPage(this.fetchByte());
                break;

            case 0xb4: // LDY $ll, X
                this.ldyZeroPageX(this.fetchByte());
                break;

            case 0xac: // LDY $hhll
                this.ldyAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xbc: // LDY $hhll, X
                this.ldyAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x85: // STA $ll
                this.staZeroPage(this.fetchByte());
                break;

            case 0x95: // STA $ll, X
                this.staZeroPageX(this.fetchByte());
                break;

            case 0x8d: // STA $hhll
                this.staAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x9d: // STA $hhll, X
                this.staAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x99: // STA $hhll, Y
                this.staAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 0x81: // STA ($ll, X)
                this.staIndexedIndirect(this.fetchByte());
                break;

            case 0x91: // STA ($ll), Y
                this.staIndirectIndexed(this.fetchByte());
                break;

            case 0x86: // STX $ll
                this.stxZeroPage(this.fetchByte());
                break;

            case 0x96: // STX $ll, Y
                this.stxZeroPageY(this.fetchByte());
                break;

            case 0x8e: // STX $hhll
                this.stxAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x84: // STY $ll
                this.styZeroPage(this.fetchByte());
                break;

            case 0x94: // STY $ll, X
                this.styZeroPageX(this.fetchByte());
                break;

            case 0x8c: // STY $hhll
                this.styAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xe6: // INC $ll
                this.incZeroPage(this.fetchByte());
                break;

            case 0xf6: // INC $ll, X
                this.incZeroPageX(this.fetchByte());
                break;

            case 0xee: // INC $hhll
                this.incAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xfe: // INC $hhll, X
                this.incAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0xc6: // DEC $ll
                this.decZeroPage(this.fetchByte());
                break;

            case 0xd6: // DEC $ll, X
                this.decZeroPageX(this.fetchByte());
                break;

            case 0xce: // DEC $hhll
                this.decAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xde: // DEC $hhll, X
                this.decAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0xe8: // INX
                this.inx();
                break;

            case 0xc8: // INY
                this.iny();
                break;

            case 0xca: // DEX
                this.dex();
                break;

            case 0x88: // DEY
                this.dey();
                break;

            case 0x18: // CLC
                this.clc();
                break;

            case 0x38: // SEC
                this.sec();
                break;

            case 0x58: // CLI
                this.cli();
                break;

            case 0x78: // SEI
                this.sei();
                break;

            case 0xd8: // CLD
                this.cld();
                break;

            case 0xf8: // SED
                this.sed();
                break;

            case 0xb8: // CLV
                this.clv();
                break;

            case 0x69: // ADC #$nn
                this.adcImmediate(this.fetchByte());
                break;

            case 0x65: // ADC $ll
                this.adcZeroPage(this.fetchByte());
                break;

            case 0x75: // ADC $ll, X
                this.adcZeroPageX(this.fetchByte());
                break;

            case 0x6d: // ADC $hhll
                this.adcAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x7d: // ADC $hhll, X
                this.adcAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x79: // ADC $hhll, Y
                this.adcAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 0x61: // ADC ($ll, X)
                this.adcIndexedIndirect(this.fetchByte());
                break;

            case 0x71: // ADC ($ll), Y
                this.adcIndirectIndexed(this.fetchByte());
                break;

            case 0xe9: // SBC #$nn
                this.sbcImmediate(this.fetchByte());
                break;

            case 0xe5: // SBC $ll
                this.sbcZeroPage(this.fetchByte());
                break;

            case 0xf5: // SBC $ll, X
                this.sbcZeroPageX(this.fetchByte());
                break;

            case 0xed: // SBC $hhll
                this.sbcAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xfd: // SBC $hhll, X
                this.sbcAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0xf9: // SBC $hhll, Y
                this.sbcAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 0xe1: // SBC ($ll, X)
                this.sbcIndexedIndirect(this.fetchByte());
                break;

            case 0xf1: // SBC ($ll), Y
                this.sbcIndirectIndexed(this.fetchByte());
                break;

            case 0xc9: // CMP #$nn
                this.cmpImmediate(this.fetchByte());
                break;

            case 0xc5: // CMP $ll
                this.cmpZeroPage(this.fetchByte());
                break;

            case 0xd5: // CMP $ll, X
                this.cmpZeroPageX(this.fetchByte());
                break;

            case 0xcd: // CMP $hhll
                this.cmpAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xdd: // CMP $hhll, X
                this.cmpAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0xd9: // CMP $hhll, Y
                this.cmpAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 0xc1: // CMP ($ll, X)
                this.cmpIndexedIndirect(this.fetchByte());
                break;

            case 0xd1: // CMP ($ll), Y
                this.cmpIndirectIndexed(this.fetchByte());
                break;

            case 0xe0: // CPX #$nn
                this.cpxImmediate(this.fetchByte());
                break;

            case 0xe4: // CPX $ll
                this.cpxZeroPage(this.fetchByte());
                break;

            case 0xec: // CPX $hhll
                this.cpxAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xc0: // CPY #$nn
                this.cpyImmediate(this.fetchByte());
                break;

            case 0xc4: // CPY $ll
                this.cpyZeroPage(this.fetchByte());
                break;

            case 0xcc: // CPY $hhll
                this.cpyAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x10: // BPL
                this.bpl(this.fetchByte());
                break;

            case 0x30: // BMI
                this.bmi(this.fetchByte());
                break;

            case 0x50: // BVC
                this.bvc(this.fetchByte());
                break;

            case 0x70: // BVS
                this.bvs(this.fetchByte());
                break;

            case 0x90: // BCC
                this.bcc(this.fetchByte());
                break;

            case 0xb0: // BCS
                this.bcs(this.fetchByte());
                break;

            case 0xd0: // BNE
                this.bne(this.fetchByte());
                break;

            case 0xf0: // BEQ
                this.beq(this.fetchByte());
                break;

            case 0x4c: // JMP $hhll
                this.jmp(this.fetchByte(), this.fetchByte());
                break;

            case 0x6c: // JMP ($hhll)
                this.jmpIndirect(this.fetchByte(), this.fetchByte());
                break;

            case 0x00: // BRK
                this.brk();
                break;

            case 0x40: // RTI
                this.rti();
                break;

            case 0x20: // JSR
                this.jsr(this.fetchByte(), this.fetchByte());
                break;

            case 0x60: // RTS
                this.rts();
                break;

            case 0x48: // PHA
                this.pha();
                break;

            case 0x68: // PLA
                this.pla();
                break;

            case 0x08: // PHP
                this.php();
                break;

            case 0x28: // PLP
                this.plp();
                break;

            case 0xaa: // TAX
                this.tax();
                break;

            case 0xa8: // TAY
                this.tay();
                break;

            case 0xba: // TSX
                this.tsx();
                break;

            case 0x8a: // TXA
                this.txa();
                break;

            case 0x98: // TYA
                this.tya();
                break;

            case 0x9a: // TXS
                this.txs();
                break;

            case 0x29: // AND #$nn
                this.andImmediate(this.fetchByte());
                break;

            case 0x25: // AND $ll
                this.andZeroPage(this.fetchByte());
                break;

            case 0x35: // AND $ll, X
                this.andZeroPageX(this.fetchByte());
                break;

            case 0x2d: // AND $hhll
                this.andAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x3d: // AND $hhll, X
                this.andAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x39: // AND $hhll, Y
                this.andAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 0x21: // AND ($ll, X)
                this.andIndexedIndirect(this.fetchByte());
                break;

            case 0x31: // AND ($ll), Y
                this.andIndirectIndexed(this.fetchByte());
                break;

            case 0x09: // ORA #$nn
                this.oraImmediate(this.fetchByte());
                break;

            case 0x05: // ORA $ll
                this.oraZeroPage(this.fetchByte());
                break;

            case 0x15: // ORA $ll, X
                this.oraZeroPageX(this.fetchByte());
                break;

            case 0x0d: // ORA $hhll
                this.oraAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x1d: // ORA $hhll, X
                this.oraAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x19: // ORA $hhll, Y
                this.oraAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 0x01: // ORA ($ll, X)
                this.oraIndexedIndirect(this.fetchByte());
                break;

            case 0x11: // ORA ($ll), Y
                this.oraIndirectIndexed(this.fetchByte());
                break;

            case 0x49: // EOR #$nn
                this.eorImmediate(this.fetchByte());
                break;

            case 0x45: // EOR $ll
                this.eorZeroPage(this.fetchByte());
                break;

            case 0x55: // EOR $ll, X
                this.eorZeroPageX(this.fetchByte());
                break;

            case 0x4d: // EOR $hhll
                this.eorAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x5d: // EOR $hhll, X
                this.eorAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x59: // EOR $hhll, Y
                this.eorAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 0x41: // EOR ($ll, X)
                this.eorIndexedIndirect(this.fetchByte());
                break;

            case 0x51: // EOR ($ll), Y
                this.eorIndirectIndexed(this.fetchByte());
                break;

            case 0x0a: // ASL Accumulator
                this.aslAccumulator();
                break;

            case 0x06: // ASL $ll
                this.aslZeroPage(this.fetchByte());
                break;

            case 0x16: // ASL $ll, X
                this.aslZeroPageX(this.fetchByte());
                break;

            case 0x0e: // ASL $hhll
                this.aslAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x1e: // ASL $hhll, X
                this.aslAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x4a: // LSR Accumulator
                this.lsrAccumulator();
                break;

            case 0x46: // LSR $ll
                this.lsrZeroPage(this.fetchByte());
                break;

            case 0x56: // LSR $ll, X
                this.lsrZeroPageX(this.fetchByte());
                break;

            case 0x4e: // LSR $hhll
                this.lsrAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x5e: // LSR $hhll, X
                this.lsrAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x2a: // ROL Accumulator
                this.rolAccumulator();
                break;

            case 0x26: // ROL $ll
                this.rolZeroPage(this.fetchByte());
                break;

            case 0x36: // ROL $ll, X
                this.rolZeroPageX(this.fetchByte());
                break;

            case 0x2e: // ROL $hhll
                this.rolAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x3e: // ROL $hhll, X
                this.rolAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x6a: // ROR Accumulator
                this.rorAccumulator();
                break;

            case 0x66: // ROR $ll
                this.rorZeroPage(this.fetchByte());
                break;

            case 0x76: // ROR $ll, X
                this.rorZeroPageX(this.fetchByte());
                break;

            case 0x6e: // ROR $hhll
                this.rorAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0x7e: // ROR $hhll, X
                this.rorAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 0x24: // BIT $ll
                this.bitZeroPage(this.fetchByte());
                break;

            case 0x2c: // BIT $hhll
                this.bitAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 0xea: // NOP

            default:
                break;
        }

        let stopTime = 0;
        if (this.isWindowAvailable) stopTime = window.performance.now();

        this.executionTimeLastInstruction = stopTime - startTime;
    }

    fetchInstruction() {
        this.ir.setInt(this.fetchByte());
    }

    fetchByte(): number {
        const offset = this.pc.int[0];
        this.pc.int[0] += 1;
        return this.mem.int[offset];
    }

    /* === COMMANDS === */

    ldaImmediate(value: number) {
        this.a.setInt(value);

        this.setArithmeticFlags(this.a.int[0]);
    }

    ldaZeroPage(zpAddr: number) {
        this.a.setInt(this.mem.int[zpAddr]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    ldaZeroPageX(zpAddr: number) {
        this.a.setInt(this.mem.int[(zpAddr + this.x.int[0]) % 256]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    ldaAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.a.setInt(this.mem.int[address]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    ldaAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        this.a.setInt(this.mem.int[addressX]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    ldaAbsoluteY(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.a.setInt(this.mem.int[addressY]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    ldaIndexedIndirect(zpAddr: number) {
        const lowByte = this.mem.int[(zpAddr + this.x.int[0]) % 256];
        const highByte = this.mem.int[(zpAddr + this.x.int[0] + 1) % 256];

        const address = lowByte + 256 * highByte;

        this.a.setInt(this.mem.int[address]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    ldaIndirectIndexed(zpAddr: number) {
        const lowByte = this.mem.int[zpAddr];
        const highByte = this.mem.int[(zpAddr + 1) % 256];

        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.a.setInt(this.mem.int[addressY]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    ldxImmediate(value: number) {
        this.x.setInt(value);

        this.setArithmeticFlags(this.x.int[0]);
    }

    ldxZeroPage(zpAddr: number) {
        this.x.setInt(this.mem.int[zpAddr]);

        this.setArithmeticFlags(this.x.int[0]);
    }

    ldxZeroPageY(zpAddr: number) {
        this.x.setInt(this.mem.int[(zpAddr + this.y.int[0]) % 256]);

        this.setArithmeticFlags(this.x.int[0]);
    }

    ldxAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.x.setInt(this.mem.int[address]);

        this.setArithmeticFlags(this.x.int[0]);
    }

    ldxAbsoluteY(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.x.setInt(this.mem.int[addressY]);

        this.setArithmeticFlags(this.x.int[0]);
    }

    ldyImmediate(value: number) {
        this.y.setInt(value);

        this.setArithmeticFlags(this.y.int[0]);
    }

    ldyZeroPage(zpAddr: number) {
        this.y.setInt(this.mem.int[zpAddr]);

        this.setArithmeticFlags(this.y.int[0]);
    }

    ldyZeroPageX(zpAddr: number) {
        this.y.setInt(this.mem.int[(zpAddr + this.x.int[0]) % 256]);

        this.setArithmeticFlags(this.y.int[0]);
    }

    ldyAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.y.setInt(this.mem.int[address]);

        this.setArithmeticFlags(this.y.int[0]);
    }

    ldyAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        this.y.setInt(this.mem.int[addressX]);

        this.setArithmeticFlags(this.y.int[0]);
    }

    staZeroPage(zpAddr: number) {
        this.mem.setInt(zpAddr, this.a.int[0]);
    }

    staZeroPageX(zpAddr: number) {
        this.mem.setInt((zpAddr + this.x.int[0]) % 256, this.a.int[0]);
    }

    staAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.mem.setInt(address, this.a.int[0]);
    }

    staAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        this.mem.setInt(addressX, this.a.int[0]);
    }

    staAbsoluteY(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.mem.setInt(addressY, this.a.int[0]);
    }

    staIndexedIndirect(zpAddr: number) {
        const lowByte = this.mem.int[(zpAddr + this.x.int[0]) % 256];
        const highByte = this.mem.int[(zpAddr + this.x.int[0] + 1) % 256];

        const address = lowByte + 256 * highByte;

        this.mem.setInt(address, this.a.int[0]);
    }

    staIndirectIndexed(zpAddr: number) {
        const lowByte = this.mem.int[zpAddr];
        const highByte = this.mem.int[(zpAddr + 1) % 256];

        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.mem.setInt(addressY, this.a.int[0]);
    }

    stxZeroPage(zpAddr: number) {
        this.mem.setInt(zpAddr, this.x.int[0]);
    }

    stxZeroPageY(zpAddr: number) {
        this.mem.setInt((zpAddr + this.y.int[0]) % 256, this.x.int[0]);
    }

    stxAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.mem.setInt(address, this.x.int[0]);
    }

    styZeroPage(zpAddr: number) {
        this.mem.setInt(zpAddr, this.y.int[0]);
    }

    styZeroPageX(zpAddr: number) {
        this.mem.setInt((zpAddr + this.x.int[0]) % 256, this.y.int[0]);
    }

    styAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.mem.setInt(address, this.y.int[0]);
    }

    incZeroPage(zpAddr: number) {
        this.mem.setInt(zpAddr, this.mem.int[zpAddr] + 1);

        this.setArithmeticFlags(this.mem.int[zpAddr]);
    }

    incZeroPageX(zpAddr: number) {
        const address = (zpAddr + this.x.int[0]) % 256;

        this.mem.setInt(address, this.mem.int[address] + 1);

        this.setArithmeticFlags(this.mem.int[address]);
    }

    incAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.mem.setInt(address, this.mem.int[address] + 1);

        this.setArithmeticFlags(this.mem.int[address]);
    }

    incAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        this.mem.setInt(addressX, this.mem.int[addressX] + 1);

        this.setArithmeticFlags(this.mem.int[addressX]);
    }

    decZeroPage(zpAddr: number) {
        this.mem.setInt(zpAddr, this.mem.int[zpAddr] - 1);

        this.setArithmeticFlags(this.mem.int[zpAddr]);
    }

    decZeroPageX(zpAddr: number) {
        const address = (zpAddr + this.x.int[0]) % 256;

        this.mem.setInt(address, this.mem.int[address] - 1);

        this.setArithmeticFlags(this.mem.int[address]);
    }

    decAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.mem.setInt(address, this.mem.int[address] - 1);

        this.setArithmeticFlags(this.mem.int[address]);
    }

    decAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        this.mem.setInt(addressX, this.mem.int[addressX] - 1);

        this.setArithmeticFlags(this.mem.int[addressX]);
    }

    inx() {
        this.x.int[0] += 1;

        this.setArithmeticFlags(this.x.int[0]);
    }

    iny() {
        this.y.int[0] += 1;

        this.setArithmeticFlags(this.y.int[0]);
    }

    dex() {
        this.x.int[0] -= 1;

        this.setArithmeticFlags(this.x.int[0]);
    }

    dey() {
        this.y.int[0] -= 1;

        this.setArithmeticFlags(this.y.int[0]);
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

    adcImmediate(value: number) {
        const flags = this.addByteToAccumulator(value);

        this.setAddSubstractFlags(flags);
    }

    adcZeroPage(zpAddr: number) {
        const flags = this.addByteToAccumulator(this.mem.int[zpAddr]);

        this.setAddSubstractFlags(flags);
    }

    adcZeroPageX(zpAddr: number) {
        const flags = this.addByteToAccumulator(this.mem.int[(zpAddr + this.x.int[0]) % 256]);

        this.setAddSubstractFlags(flags);
    }

    adcAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        const flags = this.addByteToAccumulator(this.mem.int[address]);

        this.setAddSubstractFlags(flags);
    }

    adcAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        const flags = this.addByteToAccumulator(this.mem.int[addressX]);

        this.setAddSubstractFlags(flags);
    }

    adcAbsoluteY(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        const flags = this.addByteToAccumulator(this.mem.int[addressY]);

        this.setAddSubstractFlags(flags);
    }

    adcIndexedIndirect(zpAddr: number) {
        const addressZp = zpAddr + this.x.int[0];

        const lowByte = this.mem.int[addressZp % 256];
        const highByte = this.mem.int[(addressZp + 1) % 256];

        const address = lowByte + 256 * highByte;

        const flags = this.addByteToAccumulator(this.mem.int[address]);

        this.setAddSubstractFlags(flags);
    }

    adcIndirectIndexed(zpAddr: number) {
        const lowByte = this.mem.int[zpAddr];
        const highByte = this.mem.int[(zpAddr + 1) % 256];

        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        /* *** */

        const flags = this.addByteToAccumulator(this.mem.int[addressY]);

        this.setAddSubstractFlags(flags);
    }

    sbcImmediate(value: number) {
        const flags = this.substractByteFromAccumulator(value);

        this.setAddSubstractFlags(flags);
    }

    sbcZeroPage(zpAddr: number) {
        const flags = this.substractByteFromAccumulator(this.mem.int[zpAddr]);

        this.setAddSubstractFlags(flags);
    }

    sbcZeroPageX(zpAddr: number) {
        const flags = this.substractByteFromAccumulator(this.mem.int[(zpAddr + this.x.int[0]) % 256]);

        this.setAddSubstractFlags(flags);
    }

    sbcAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        const flags = this.substractByteFromAccumulator(this.mem.int[address]);

        this.setAddSubstractFlags(flags);
    }

    sbcAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        const flags = this.substractByteFromAccumulator(this.mem.int[addressX]);

        this.setAddSubstractFlags(flags);
    }

    sbcAbsoluteY(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        const flags = this.substractByteFromAccumulator(this.mem.int[addressY]);

        this.setAddSubstractFlags(flags);
    }

    sbcIndexedIndirect(zpAddr: number) {
        const addressZp = zpAddr + this.x.int[0];

        const lowByte = this.mem.int[addressZp % 256];
        const highByte = this.mem.int[(addressZp + 1) % 256];

        const address = lowByte + 256 * highByte;

        const flags = this.substractByteFromAccumulator(this.mem.int[address]);

        this.setAddSubstractFlags(flags);
    }

    sbcIndirectIndexed(zpAddr: number) {
        const lowByte = this.mem.int[zpAddr];
        const highByte = this.mem.int[(zpAddr + 1) % 256];

        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        const flags = this.substractByteFromAccumulator(this.mem.int[addressY]);

        this.setAddSubstractFlags(flags);
    }

    cmpImmediate(operand: number) {
        this.setCompareFlags(this.a.int[0], operand);
    }

    cmpZeroPage(zpAddr: number) {
        this.setCompareFlags(this.a.int[0], this.mem.int[zpAddr]);
    }

    cmpZeroPageX(zpAddr: number) {
        this.setCompareFlags(this.a.int[0], this.mem.int[(zpAddr + this.x.int[0]) % 256]);
    }

    cmpAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.setCompareFlags(this.a.int[0], this.mem.int[address]);
    }

    cmpAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        this.setCompareFlags(this.a.int[0], this.mem.int[addressX]);
    }

    cmpAbsoluteY(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.setCompareFlags(this.a.int[0], this.mem.int[addressY]);
    }

    cmpIndexedIndirect(zpAddr: number) {
        const addressZp = zpAddr + this.x.int[0];

        const lowByte = this.mem.int[addressZp % 256];
        const highByte = this.mem.int[(addressZp + 1) % 256];

        const address = lowByte + 256 * highByte;

        this.setCompareFlags(this.a.int[0], this.mem.int[address]);
    }

    cmpIndirectIndexed(zpAddr: number) {
        const lowByte = this.mem.int[zpAddr];
        const highByte = this.mem.int[(zpAddr + 1) % 256];

        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.setCompareFlags(this.a.int[0], this.mem.int[addressY]);
    }

    cpxImmediate(operand: number) {
        this.setCompareFlags(this.x.int[0], operand);
    }

    cpxZeroPage(zpAddr: number) {
        this.setCompareFlags(this.x.int[0], this.mem.int[zpAddr]);
    }

    cpxAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.setCompareFlags(this.x.int[0], this.mem.int[address]);
    }

    cpyImmediate(operand: number) {
        this.setCompareFlags(this.y.int[0], operand);
    }

    cpyZeroPage(zpAddr: number) {
        this.setCompareFlags(this.y.int[0], this.mem.int[zpAddr]);
    }

    cpyAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.setCompareFlags(this.y.int[0], this.mem.int[address]);
    }

    bpl(operand: number) {
        if (!this.p.getNegativeFlag()) {
            this.addToWord(this.pc, this.asSigned(operand));
        }
    }

    bmi(operand: number) {
        if (this.p.getNegativeFlag()) {
            this.addToWord(this.pc, this.asSigned(operand));
        }
    }

    bvc(operand: number) {
        if (!this.p.getOverflowFlag()) {
            this.addToWord(this.pc, this.asSigned(operand));
        }
    }

    bvs(operand: number) {
        if (this.p.getOverflowFlag()) {
            this.addToWord(this.pc, this.asSigned(operand));
        }
    }

    bcc(operand: number) {
        if (!this.p.getCarryFlag()) {
            this.addToWord(this.pc, this.asSigned(operand));
        }
    }

    bcs(operand: number) {
        if (this.p.getCarryFlag()) {
            this.addToWord(this.pc, this.asSigned(operand));
        }
    }

    bne(operand: number) {
        if (!this.p.getZeroFlag()) {
            this.addToWord(this.pc, this.asSigned(operand));
        }
    }

    beq(operand: number) {
        if (this.p.getZeroFlag()) {
            this.addToWord(this.pc, this.asSigned(operand));
        }
    }

    jmp(lowByte: number, highByte: number) {
        this.pc.setInt(lowByte, highByte);
    }

    jmpIndirect(lowByte: number, highByte: number) {
        let addressLowByte = lowByte + 256 * highByte;
        let addressHighByte = ((lowByte + 1) % 256) + 256 * highByte;

        const lowByteIndirect = this.mem.int[addressLowByte];
        const highByteIndirect = this.mem.int[addressHighByte];

        this.pc.setInt(lowByteIndirect, highByteIndirect);
    }

    brk() {
        // pc is already incr by 3 through fetching
        // reduce by 1 for compatibility
        this.pc.int[0] -= 1;

        // skip to next instruction for return address
        this.pc.int[0] += 2;

        this.pushOnStack(this.pc.getHighByte());
        this.pushOnStack(this.pc.getLowByte());

        const pWithBreakFlag = new ProcessorStatusRegister(this.p.int[0]);
        pWithBreakFlag.setBreakFlag(true);

        this.pushOnStack(pWithBreakFlag.int[0]); // Break flag is always set

        this.p.setInterruptFlag(true);

        this.pc.setInt(this.mem.int[0xfffe], this.mem.int[0xffff]);

        this.brkReached = true;
    }

    irq() {
        // this is not an opcode but the procedure that runs when a hardwarre interrupt is set

        this.pushOnStack(this.pc.getHighByte());
        this.pushOnStack(this.pc.getLowByte());

        const pWithoutBreakFlag = new ProcessorStatusRegister(this.p.int[0]);
        pWithoutBreakFlag.setBreakFlag(false);

        this.pushOnStack(pWithoutBreakFlag.int[0]);

        this.p.setInterruptFlag(true);

        this.pc.setInt(this.mem.int[0xfffe], this.mem.int[0xffff]);
    }

    rti() {
        this.p.setInt(this.pullFromStack());

        this.p.setExpansionBit();
        this.p.setBreakFlag(false);

        const lowByte = this.pullFromStack();
        const highByte = this.pullFromStack();

        this.pc.setInt(lowByte, highByte);
    }

    jsr(lowByte: number, highByte: number) {
        // pc is already incr by 3 through fetching
        // reduce by 1 for compatibility
        this.pc.int[0] -= 1;

        this.pushOnStack(this.pc.getHighByte());
        this.pushOnStack(this.pc.getLowByte());

        this.pc.setInt(lowByte, highByte);
    }

    rts() {
        const lowByte = this.pullFromStack();
        const highByte = this.pullFromStack();

        this.pc.setInt(lowByte, highByte);

        this.pc.int[0] += 1;
    }

    pha() {
        this.pushOnStack(this.a.int[0]);
    }

    pla() {
        this.a.setInt(this.pullFromStack());

        this.setArithmeticFlags(this.a.int[0]);
    }

    php() {
        const pWithBreakFlag = new ProcessorStatusRegister(this.p.int[0]);
        pWithBreakFlag.setBreakFlag(true);

        this.pushOnStack(pWithBreakFlag.int[0]);
    }

    plp() {
        this.p.setInt(this.pullFromStack());

        this.p.setExpansionBit();
        this.p.setBreakFlag(false);
    }

    tax() {
        this.x.setInt(this.a.int[0]);
        this.setArithmeticFlags(this.x.int[0]);
    }

    tay() {
        this.y.setInt(this.a.int[0]);
        this.setArithmeticFlags(this.y.int[0]);
    }

    tsx() {
        this.x.setInt(this.s.int[0]);
        this.setArithmeticFlags(this.x.int[0]);
    }

    txa() {
        this.a.setInt(this.x.int[0]);
        this.setArithmeticFlags(this.a.int[0]);
    }

    tya() {
        this.a.setInt(this.y.int[0]);
        this.setArithmeticFlags(this.a.int[0]);
    }

    txs() {
        this.s.setInt(this.x.int[0]);
    }

    andImmediate(value: number) {
        this.a.setInt(this.a.int[0] & value);

        this.setArithmeticFlags(this.a.int[0]);
    }

    andZeroPage(zpAddr: number) {
        this.a.setInt(this.a.int[0] & this.mem.int[zpAddr]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    andZeroPageX(zpAddr: number) {
        this.a.setInt(this.a.int[0] & this.mem.int[(zpAddr + this.x.int[0]) % 256]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    andAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.a.setInt(this.a.int[0] & this.mem.int[address]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    andAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        this.a.setInt(this.a.int[0] & this.mem.int[addressX]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    andAbsoluteY(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.a.setInt(this.a.int[0] & this.mem.int[addressY]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    andIndexedIndirect(zpAddr: number) {
        const addressZp = zpAddr + this.x.int[0];

        const lowByte = this.mem.int[addressZp % 256];
        const highByte = this.mem.int[(addressZp + 1) % 256];

        const address = lowByte + 256 * highByte;

        this.a.setInt(this.a.int[0] & this.mem.int[address]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    andIndirectIndexed(zpAddr: number) {
        const lowByte = this.mem.int[zpAddr];
        const highByte = this.mem.int[(zpAddr + 1) % 256];

        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.a.setInt(this.a.int[0] & this.mem.int[addressY]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    oraImmediate(value: number) {
        this.a.setInt(this.a.int[0] | value);

        this.setArithmeticFlags(this.a.int[0]);
    }

    oraZeroPage(zpAddr: number) {
        this.a.setInt(this.a.int[0] | this.mem.int[zpAddr]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    oraZeroPageX(zpAddr: number) {
        this.a.setInt(this.a.int[0] | this.mem.int[(zpAddr + this.x.int[0]) % 256]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    oraAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.a.setInt(this.a.int[0] | this.mem.int[address]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    oraAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        this.a.setInt(this.a.int[0] | this.mem.int[addressX]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    oraAbsoluteY(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.a.setInt(this.a.int[0] | this.mem.int[addressY]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    oraIndexedIndirect(zpAddr: number) {
        const addressZp = zpAddr + this.x.int[0];

        const lowByte = this.mem.int[addressZp % 256];
        const highByte = this.mem.int[(addressZp + 1) % 256];

        const address = lowByte + 256 * highByte;

        this.a.setInt(this.a.int[0] | this.mem.int[address]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    oraIndirectIndexed(zpAddr: number) {
        const lowByte = this.mem.int[zpAddr];
        const highByte = this.mem.int[(zpAddr + 1) % 256];

        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.a.setInt(this.a.int[0] | this.mem.int[addressY]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    eorImmediate(value: number) {
        this.a.setInt(this.a.int[0] ^ value);

        this.setArithmeticFlags(this.a.int[0]);
    }

    eorZeroPage(zpAddr: number) {
        this.a.setInt(this.a.int[0] ^ this.mem.int[zpAddr]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    eorZeroPageX(zpAddr: number) {
        this.a.setInt(this.a.int[0] ^ this.mem.int[(zpAddr + this.x.int[0]) % 256]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    eorAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.a.setInt(this.a.int[0] ^ this.mem.int[address]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    eorAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        this.a.setInt(this.a.int[0] ^ this.mem.int[addressX]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    eorAbsoluteY(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.a.setInt(this.a.int[0] ^ this.mem.int[addressY]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    eorIndexedIndirect(zpAddr: number) {
        const addressZp = zpAddr + this.x.int[0];

        const lowByte = this.mem.int[addressZp % 256];
        const highByte = this.mem.int[(addressZp + 1) % 256];

        const address = lowByte + 256 * highByte;

        this.a.setInt(this.a.int[0] ^ this.mem.int[address]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    eorIndirectIndexed(zpAddr: number) {
        const lowByte = this.mem.int[zpAddr];
        const highByte = this.mem.int[(zpAddr + 1) % 256];

        const address = lowByte + 256 * highByte;
        const addressY = this.addByteToWord(address, this.y.int[0]);

        this.a.setInt(this.a.int[0] ^ this.mem.int[addressY]);

        this.setArithmeticFlags(this.a.int[0]);
    }

    aslAccumulator() {
        // C-B-B-B-B-B-B-B-0 <<

        const uint16 = new Uint16Array(this.a.int);
        uint16[0] = uint16[0] << 1;
        this.a.int[0] = uint16[0] & 0x00ff;
        const carry = (uint16[0] & 0xff00) >>> 8 === 1 ? true : false;

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a.int[0]);
    }

    aslZeroPage(zpAddr: number) {
        const carry = this.shiftLeftMemAddr(zpAddr);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[zpAddr]);
    }

    aslZeroPageX(zpAddr: number) {
        const addressZp = (zpAddr + this.x.int[0]) % 256;

        const carry = this.shiftLeftMemAddr(addressZp);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[addressZp]);
    }

    aslAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        const carry = this.shiftLeftMemAddr(address);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[address]);
    }

    aslAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        const carry = this.shiftLeftMemAddr(addressX);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[addressX]);
    }

    lsrAccumulator() {
        // >> 0-B-B-B-B-B-B-B-C

        const uint16 = new Uint16Array(this.a.int);
        uint16[0] = uint16[0] << 7; // shift left 7 = shift left 8 and shift right 1
        this.a.int[0] = (uint16[0] & 0xff00) >>> 8;
        const carry = (uint16[0] & 0x00ff) === 128 ? true : false;

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a.int[0]);
    }

    lsrZeroPage(zpAddr: number) {
        const carry = this.shiftRightMemAddr(zpAddr);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[zpAddr]);
    }

    lsrZeroPageX(zpAddr: number) {
        const address = (zpAddr + this.x.int[0]) % 256;

        const carry = this.shiftRightMemAddr(address);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[address]);
    }

    lsrAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        const carry = this.shiftRightMemAddr(address);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[address]);
    }

    lsrAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        const carry = this.shiftRightMemAddr(addressX);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[addressX]);
    }

    rolAccumulator() {
        // (new)C-B-B-B-B-B-B-B-B-C(old) <<
        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;

        const uint16 = new Uint16Array(this.a.int);
        uint16[0] = uint16[0] << 1;
        this.a.int[0] = (uint16[0] & 0x00ff) | carryBit;
        const carry = (uint16[0] & 0xff00) >>> 8 === 1 ? true : false;

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a.int[0]);
    }

    rolZeroPage(zpAddr: number) {
        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;
        const carry = this.rotateLeftMemAddr(zpAddr, carryBit);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[zpAddr]);
    }

    rolZeroPageX(zpAddr: number) {
        const address = (zpAddr + this.x.int[0]) % 256;

        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;
        const carry = this.rotateLeftMemAddr(address, carryBit);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[address]);
    }

    rolAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;
        const carry = this.rotateLeftMemAddr(address, carryBit);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[address]);
    }

    rolAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;
        const carry = this.rotateLeftMemAddr(addressX, carryBit);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[addressX]);
    }

    rorAccumulator() {
        // >> (old)C-B-B-B-B-B-B-B-B-C(new)

        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;

        const uint16 = new Uint16Array(this.a.int);
        uint16[0] = uint16[0] << 7; // shift left 7 = shift left 8 and shift right 1
        this.a.int[0] = ((uint16[0] & 0xff00) >>> 8) | (carryBit << 7);
        const carry = (uint16[0] & 0x00ff) === 128 ? true : false;

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a.int[0]);
    }

    rorZeroPage(zpAddr: number) {
        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;
        const carry = this.rotateRightMemAddr(zpAddr, carryBit);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[zpAddr]);
    }

    rorZeroPageX(zpAddr: number) {
        const address = (zpAddr + this.x.int[0]) % 256;

        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;
        const carry = this.rotateRightMemAddr(address, carryBit);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[address]);
    }

    rorAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;
        const carry = this.rotateRightMemAddr(address, carryBit);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[address]);
    }

    rorAbsoluteX(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;
        const addressX = this.addByteToWord(address, this.x.int[0]);

        let carryBit = this.p.getCarryFlag() === true ? 1 : 0;
        const carry = this.rotateRightMemAddr(addressX, carryBit);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.int[addressX]);
    }

    bitZeroPage(zpAddr: number) {
        this.p.setNegativeFlag(this.getBitByIndex(this.mem.int[zpAddr], 7));
        this.p.setOverflowFlag(this.getBitByIndex(this.mem.int[zpAddr], 6));

        this.p.setZeroFlag((this.a.int[0] & this.mem.int[zpAddr]) === 0 ? true : false);
    }

    bitAbsolute(lowByte: number, highByte: number) {
        const address = lowByte + 256 * highByte;

        this.p.setNegativeFlag(this.getBitByIndex(this.mem.int[address], 7));
        this.p.setOverflowFlag(this.getBitByIndex(this.mem.int[address], 6));

        this.p.setZeroFlag((this.a.int[0] & this.mem.int[address]) === 0 ? true : false);
    }

    /* === COMMAND HELPER === */

    getBitByIndex(byte: number, index: number) {
        return byte.toString(2).padStart(8, '0')[7 - index] === '1' ? true : false;
    }

    setArithmeticFlags(byte: number) {
        this.p.setNegativeFlag(byte > 127);
        this.p.setZeroFlag(byte === 0);
    }

    setAddSubstractFlags({ carry, overflow, negative, zero }: { carry: boolean; overflow: boolean; negative: boolean; zero: boolean }) {
        this.p.setCarryFlag(carry);
        this.p.setOverflowFlag(overflow);
        this.p.setNegativeFlag(negative);
        this.p.setZeroFlag(zero);
    }

    setCompareFlags(register: number, value: number) {
        let result = this.asSigned(register) - this.asSigned(value);
        result = result > 127 ? result - 256 : result;
        result = result < -128 ? result + 256 : result;

        this.p.setNegativeFlag(result < 0);
        this.p.setZeroFlag(register === value);
        this.p.setCarryFlag(register >= value);
    }

    asSigned(int: number) {
        return int > 127 ? int - 256 : int;
    }

    addByteToAccumulator(value: number) {
        const decimal = this.p.getDecimalFlag();

        const c = this.p.getCarryFlag() === true ? 1 : 0;
        const a = this.a.int[0];
        const b = value;

        const aSigned = a > 127 ? a - 256 : a;
        const bSigned = b > 127 ? b - 256 : b;

        let negative;
        let overflow;
        let zero;
        let carry;

        let result;

        if (decimal) {
            result = (a & 0x0f) + (b & 0x0f) + c;
            if (result > 0x09) result += 0x06;
            result = (a & 0xf0) + (b & 0xf0) + (result > 0x0f ? 0x10 : 0) + (result & 0x0f);
        } else {
            result = (a & 0xff) + b + c;
        }

        if (~(a ^ b) & (a ^ result) & 0x80) {
            overflow = true;
        } else {
            overflow = false;
        }

        if (decimal && result > 0x9f) {
            result += 0x60;
        }

        carry = result > 0xff ? true : false;

        // uint16 to uint8
        result = result & 0x00ff;

        this.a.setInt((this.a.int[0] & 0xff00) | result);

        const resultSigned = aSigned + bSigned + c;

        zero = resultSigned === 0 ? true : false;

        // Reference: http://www.6502.org/tutorials/decimal_mode.html#A
        if (decimal) {
            let a2;
            let temp2;

            temp2 = (aSigned & 0x0f) + (bSigned & 0x0f) + c; // 2a
            if (temp2 >= 0x0a) temp2 = ((temp2 + 0x06) & 0x0f) + 0x10; // 2b

            a2 = (aSigned & 0xf0) + (bSigned & 0xf0) + temp2; // 2c

            // uint16 to uint8
            a2 = a2 & 0x00ff;

            negative = a2 > 127 && a2 <= 255 ? true : false; // 2e
        } else {
            negative = (resultSigned < 0 && resultSigned >= -128) || resultSigned > 127 ? true : false;
        }

        return { carry, overflow, negative, zero };
    }

    substractByteFromAccumulator(value: number) {
        const decimal = this.p.getDecimalFlag();

        const c = this.p.getCarryFlag() === true ? 1 : 0;
        const a = this.a.int[0];
        const b = value;

        const aSigned = a > 127 ? a - 256 : a;
        const bSigned = b > 127 ? b - 256 : b;

        let negative;
        let overflow;
        let zero;
        let carry;

        let tmp;
        let w;

        if (decimal) {
            tmp = 0xf + (a & 0xf) - (b & 0xf) + c;

            if (tmp < 0x10) {
                w = 0;
                tmp -= 0x06;
            } else {
                w = 0x10;
                tmp -= 0x10;
            }

            w += 0xf0 + (a & 0xf0) - (b & 0xf0);

            if (w < 0x100) {
                carry = false;
                w -= 0x60;
            } else {
                carry = true;
            }

            w += tmp;
        } else {
            w = 0xff + a - b + c;
            carry = w < 0x100 ? false : true;
        }

        w = w & 0xff;

        if (decimal && (b & 0xf) > 9 && (w & 0xf) > 9) w = w + 16;

        this.a.setInt(w);

        const result = a - b + c - 1;
        const resultSigned = aSigned - bSigned + c - 1;

        const resultX = result < -128 || result > 127 ? ~result : result;

        zero = resultSigned === 0 ? true : false;
        overflow = resultSigned < -128 || resultSigned > 127 ? true : false;
        negative = resultX < 0 ? true : false;

        return { carry, overflow, negative, zero };
    }

    pushOnStack(value: number) {
        this.mem.setInt(256 + this.s.int[0], value);
        this.s.int[0] -= 1;
    }

    pullFromStack() {
        this.s.int[0] += 1;
        return this.mem.int[256 + this.s.int[0]];
    }

    addByteToWord(word: number, byte: number) {
        let value = word + byte;
        return value % 65536;
    }

    addToByte(byte: Byte, value: number) {
        let result = byte.int[0] + value;

        if (result > 255) result = result % 256;
        if (result < 0) result = 256 + result; // result is negative

        byte.setInt(result);
    }

    addToWord(word: Word, value: number) {
        let result = word.int[0] + value;

        if (result > 65535) result = result % 65536;
        if (result < 0) result = 65536 + result; // result is negative

        word.setInt(result & 0x00ff, (result & 0xff00) >> 8);
    }

    shiftLeftMemAddr(index: number) {
        const uint16 = new Uint16Array(1);
        uint16[0] = this.mem.int[index];
        uint16[0] = uint16[0] << 1;
        this.mem.setInt(index, uint16[0] & 0x00ff);
        return (uint16[0] & 0xff00) >>> 8 === 1 ? true : false;
    }

    shiftRightMemAddr(index: number) {
        const uint16 = new Uint16Array(1);
        uint16[0] = this.mem.int[index];
        uint16[0] = uint16[0] << 7; // shift left 7 = shift left 8 and shift right 1
        this.mem.setInt(index, (uint16[0] & 0xff00) >>> 8);
        return (uint16[0] & 0x00ff) === 128 ? true : false;
    }

    rotateLeftMemAddr(index: number, carryBit: number) {
        const uint16 = new Uint16Array(1);
        uint16[0] = this.mem.int[index];
        uint16[0] = uint16[0] << 1;
        this.mem.setInt(index, (uint16[0] & 0x00ff) | carryBit);
        return (uint16[0] & 0xff00) >>> 8 === 1 ? true : false;
    }

    rotateRightMemAddr(index: number, carryBit: number) {
        const uint16 = new Uint16Array(1);
        uint16[0] = this.mem.int[index];
        uint16[0] = uint16[0] << 7; // shift left 7 = shift left 8 and shift right 1
        this.mem.setInt(index, ((uint16[0] & 0xff00) >>> 8) | (carryBit << 7));
        return (uint16[0] & 0x00ff) === 128 ? true : false;
    }
}
