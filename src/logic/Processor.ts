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
    isRunning: boolean = false;
    intervalId: number = 0;
    executionTimeLastInstruction: string = '';
    graphics: Graphics | null = null;
    private timer: (cycleCounter: number) => boolean;

    constructor(memory: Memory, callback: (cycleCounter: number) => boolean) {
        this.mem = memory;
        this.timer = callback;

        this.initRegisters();
    }

    initRegisters() {
        this.ir.setAsHexString('00');
        this.a.setAsHexString('00');
        this.x.setAsHexString('00');
        this.y.setAsHexString('00');
        this.s.setAsHexString('FF');
        this.p.initRegister();
        this.pc.lowByte.setAsHexString('00');
        this.pc.highByte.setAsHexString('00');
    }

    async startProcessor() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.intervalId = setInterval(() => {
            if (this.timer(this.cycleCounter) && !this.p.getInterruptFlag()) {
                this.irq(); // timer based interrupt
                this.cycleCounter = this.cycleCounter + 7;
                //this.stopProcessor();
            }
            if (!this.isRunning) {
                clearInterval(this.intervalId);
                return;
            }
            this.processInstruction();
        }, 0);
    }

    stopProcessor() {
        if (!this.isRunning) return;

        this.isRunning = false;
    }

    processInstruction() {
        let startTime = 0;
        if (typeof window !== 'undefined') startTime = window.performance.now();

        this.instructionCounter++;
        this.cycleCounter = this.cycleCounter + (references.find(element => element.opc === this.ir.getAsHexString())?.cycles || 0);

        this.fetchInstruction();

        switch (this.ir.getAsHexString()) {
            case 'A9': // LDA #$nn
                this.ldaImmediate(this.fetchByte());
                break;

            case 'A5': // LDA $ll
                this.ldaZeroPage(this.fetchByte());
                break;

            case 'B5': // LDA $ll, X
                this.ldaZeroPageX(this.fetchByte());
                break;

            case 'AD': // LDA $hhll
                this.ldaAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'BD': // LDA $hhll, X
                this.ldaAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 'B9': // LDA $hhll, Y
                this.ldaAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 'A1': // LDA ($ll, X)
                this.ldaIndexedIndirect(this.fetchByte());
                break;

            case 'B1': // LDA ($ll), Y
                this.ldaIndirectIndexed(this.fetchByte());
                break;

            case 'A2': // LDX #$nn
                this.ldxImmediate(this.fetchByte());
                break;

            case 'A6': // LDX $ll
                this.ldxZeroPage(this.fetchByte());
                break;

            case 'B6': // LDX $ll, Y
                this.ldxZeroPageY(this.fetchByte());
                break;

            case 'AE': // LDX $hhll
                this.ldxAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'BE': // LDX $hhll, Y
                this.ldxAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 'A0': // LDY #$nn
                this.ldyImmediate(this.fetchByte());
                break;

            case 'A4': // LDY $ll
                this.ldyZeroPage(this.fetchByte());
                break;

            case 'B4': // LDY $ll, X
                this.ldyZeroPageX(this.fetchByte());
                break;

            case 'AC': // LDY $hhll
                this.ldyAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'BC': // LDY $hhll, X
                this.ldyAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '85': // STA $ll
                this.staZeroPage(this.fetchByte());
                break;

            case '95': // STA $ll, X
                this.staZeroPageX(this.fetchByte());
                break;

            case '8D': // STA $hhll
                this.staAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '9D': // STA $hhll, X
                this.staAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '99': // STA $hhll, Y
                this.staAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '81': // STA ($ll, X)
                this.staIndexedIndirect(this.fetchByte());
                break;

            case '91': // STA ($ll), Y
                this.staIndirectIndexed(this.fetchByte());
                break;

            case '86': // STX $ll
                this.stxZeroPage(this.fetchByte());
                break;

            case '96': // STX $ll, Y
                this.stxZeroPageY(this.fetchByte());
                break;

            case '8E': // STX $hhll
                this.stxAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '84': // STY $ll
                this.styZeroPage(this.fetchByte());
                break;

            case '94': // STY $ll, X
                this.styZeroPageX(this.fetchByte());
                break;

            case '8C': // STY $hhll
                this.styAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'E6': // INC $ll
                this.incZeroPage(this.fetchByte());
                break;

            case 'F6': // INC $ll, X
                this.incZeroPageX(this.fetchByte());
                break;

            case 'EE': // INC $hhll
                this.incAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'FE': // INC $hhll, X
                this.incAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 'C6': // DEC $ll
                this.decZeroPage(this.fetchByte());
                break;

            case 'D6': // DEC $ll, X
                this.decZeroPageX(this.fetchByte());
                break;

            case 'CE': // DEC $hhll
                this.decAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'DE': // DEC $hhll, X
                this.decAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 'E8': // INX
                this.inx();
                break;

            case 'C8': // INY
                this.iny();
                break;

            case 'CA': // DEX
                this.dex();
                break;

            case '88': // DEY
                this.dey();
                break;

            case '18': // CLC
                this.clc();
                break;

            case '38': // SEC
                this.sec();
                break;

            case '58': // CLI
                this.cli();
                break;

            case '78': // SEI
                this.sei();
                break;

            case 'D8': // CLD
                this.cld();
                break;

            case 'F8': // SED
                this.sed();
                break;

            case 'B8': // CLV
                this.clv();
                break;

            case '69': // ADC #$nn
                this.adcImmediate(this.fetchByte());
                break;

            case '65': // ADC $ll
                this.adcZeroPage(this.fetchByte());
                break;

            case '75': // ADC $ll, X
                this.adcZeroPageX(this.fetchByte());
                break;

            case '6D': // ADC $hhll
                this.adcAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '7D': // ADC $hhll, X
                this.adcAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '79': // ADC $hhll, Y
                this.adcAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '61': // ADC ($ll, X)
                this.adcIndexedIndirect(this.fetchByte());
                break;

            case '71': // ADC ($ll), Y
                this.adcIndirectIndexed(this.fetchByte());
                break;

            case 'E9': // SBC #$nn
                this.sbcImmediate(this.fetchByte());
                break;

            case 'E5': // SBC $ll
                this.sbcZeroPage(this.fetchByte());
                break;

            case 'F5': // SBC $ll, X
                this.sbcZeroPageX(this.fetchByte());
                break;

            case 'ED': // SBC $hhll
                this.sbcAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'FD': // SBC $hhll, X
                this.sbcAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 'F9': // SBC $hhll, Y
                this.sbcAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 'E1': // SBC ($ll, X)
                this.sbcIndexedIndirect(this.fetchByte());
                break;

            case 'F1': // SBC ($ll), Y
                this.sbcIndirectIndexed(this.fetchByte());
                break;

            case 'C9': // CMP #$nn
                this.cmpImmediate(this.fetchByte());
                break;

            case 'C5': // CMP $ll
                this.cmpZeroPage(this.fetchByte());
                break;

            case 'D5': // CMP $ll, X
                this.cmpZeroPageX(this.fetchByte());
                break;

            case 'CD': // CMP $hhll
                this.cmpAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'DD': // CMP $hhll, X
                this.cmpAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case 'D9': // CMP $hhll, Y
                this.cmpAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case 'C1': // CMP ($ll, X)
                this.cmpIndexedIndirect(this.fetchByte());
                break;

            case 'D1': // CMP ($ll), Y
                this.cmpIndirectIndexed(this.fetchByte());
                break;

            case 'E0': // CPX #$nn
                this.cpxImmediate(this.fetchByte());
                break;

            case 'E4': // CPX $ll
                this.cpxZeroPage(this.fetchByte());
                break;

            case 'EC': // CPX $hhll
                this.cpxAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'C0': // CPY #$nn
                this.cpyImmediate(this.fetchByte());
                break;

            case 'C4': // CPY $ll
                this.cpyZeroPage(this.fetchByte());
                break;

            case 'CC': // CPY $hhll
                this.cpyAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '10': // BPL
                this.bpl(this.fetchByte());
                break;

            case '30': // BMI
                this.bmi(this.fetchByte());
                break;

            case '50': // BVC
                this.bvc(this.fetchByte());
                break;

            case '70': // BVS
                this.bvs(this.fetchByte());
                break;

            case '90': // BCC
                this.bcc(this.fetchByte());
                break;

            case 'B0': // BCS
                this.bcs(this.fetchByte());
                break;

            case 'D0': // BNE
                this.bne(this.fetchByte());
                break;

            case 'F0': // BEQ
                this.beq(this.fetchByte());
                break;

            case '4C': // JMP $hhll
                this.jmp(this.fetchByte(), this.fetchByte());
                break;

            case '6C': // JMP ($hhll)
                this.jmpIndirect(this.fetchByte(), this.fetchByte());
                break;

            case '00': // BRK
                this.brk();
                break;

            case '40': // RTI
                this.rti();
                break;

            case '20': // JSR
                this.jsr(this.fetchByte(), this.fetchByte());
                break;

            case '60': // RTS
                this.rts();
                break;

            case '48': // PHA
                this.pha();
                break;

            case '68': // PLA
                this.pla();
                break;

            case '08': // PHP
                this.php();
                break;

            case '28': // PLP
                this.plp();
                break;

            case 'AA': // TAX
                this.tax();
                break;

            case 'A8': // TAY
                this.tay();
                break;

            case 'BA': // TSX
                this.tsx();
                break;

            case '8A': // TXA
                this.txa();
                break;

            case '98': // TYA
                this.tya();
                break;

            case '9A': // TXS
                this.txs();
                break;

            case '29': // AND #$nn
                this.andImmediate(this.fetchByte());
                break;

            case '25': // AND $ll
                this.andZeroPage(this.fetchByte());
                break;

            case '35': // AND $ll, X
                this.andZeroPageX(this.fetchByte());
                break;

            case '2D': // AND $hhll
                this.andAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '3D': // AND $hhll, X
                this.andAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '39': // AND $hhll, Y
                this.andAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '21': // AND ($ll, X)
                this.andIndexedIndirect(this.fetchByte());
                break;

            case '31': // AND ($ll), Y
                this.andIndirectIndexed(this.fetchByte());
                break;

            case '09': // ORA #$nn
                this.oraImmediate(this.fetchByte());
                break;

            case '05': // ORA $ll
                this.oraZeroPage(this.fetchByte());
                break;

            case '15': // ORA $ll, X
                this.oraZeroPageX(this.fetchByte());
                break;

            case '0D': // ORA $hhll
                this.oraAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '1D': // ORA $hhll, X
                this.oraAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '19': // ORA $hhll, Y
                this.oraAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '01': // ORA ($ll, X)
                this.oraIndexedIndirect(this.fetchByte());
                break;

            case '11': // ORA ($ll), Y
                this.oraIndirectIndexed(this.fetchByte());
                break;

            case '49': // EOR #$nn
                this.eorImmediate(this.fetchByte());
                break;

            case '45': // EOR $ll
                this.eorZeroPage(this.fetchByte());
                break;

            case '55': // EOR $ll, X
                this.eorZeroPageX(this.fetchByte());
                break;

            case '4D': // EOR $hhll
                this.eorAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '5D': // EOR $hhll, X
                this.eorAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '59': // EOR $hhll, Y
                this.eorAbsoluteY(this.fetchByte(), this.fetchByte());
                break;

            case '41': // EOR ($ll, X)
                this.eorIndexedIndirect(this.fetchByte());
                break;

            case '51': // EOR ($ll), Y
                this.eorIndirectIndexed(this.fetchByte());
                break;

            case '0A': // ASL Accumulator
                this.aslAccumulator();
                break;

            case '06': // ASL $ll
                this.aslZeroPage(this.fetchByte());
                break;

            case '16': // ASL $ll, X
                this.aslZeroPageX(this.fetchByte());
                break;

            case '0E': // ASL $hhll
                this.aslAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '1E': // ASL $hhll, X
                this.aslAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '4A': // LSR Accumulator
                this.lsrAccumulator();
                break;

            case '46': // LSR $ll
                this.lsrZeroPage(this.fetchByte());
                break;

            case '56': // LSR $ll, X
                this.lsrZeroPageX(this.fetchByte());
                break;

            case '4E': // LSR $hhll
                this.lsrAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '5E': // LSR $hhll, X
                this.lsrAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '2A': // ROL Accumulator
                this.rolAccumulator();
                break;

            case '26': // ROL $ll
                this.rolZeroPage(this.fetchByte());
                break;

            case '36': // ROL $ll, X
                this.rolZeroPageX(this.fetchByte());
                break;

            case '2E': // ROL $hhll
                this.rolAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '3E': // ROL $hhll, X
                this.rolAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '6A': // ROR Accumulator
                this.rorAccumulator();
                break;

            case '66': // ROR $ll
                this.rorZeroPage(this.fetchByte());
                break;

            case '76': // ROR $ll, X
                this.rorZeroPageX(this.fetchByte());
                break;

            case '6E': // ROR $hhll
                this.rorAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case '7E': // ROR $hhll, X
                this.rorAbsoluteX(this.fetchByte(), this.fetchByte());
                break;

            case '24': // BIT $ll
                this.bitZeroPage(this.fetchByte());
                break;

            case '2C': // BIT $hhll
                this.bitAbsolute(this.fetchByte(), this.fetchByte());
                break;

            case 'EA': // NOP

            default:
                break;
        }

        let stopTime = 0;
        if (typeof window !== 'undefined') stopTime = window.performance.now();

        this.executionTimeLastInstruction = (stopTime - startTime).toFixed(3).padEnd(5, '0');
    }

    fetchInstruction() {
        this.ir.setInt(this.fetchByte().getInt());
    }

    fetchByte() {
        const offset = this.pc.getInt();
        this.incrementWord(this.pc);
        return this.mem.getByte(offset);
    }

    /* === COMMANDS === */

    ldaImmediate(value: Byte) {
        this.a.setInt(value.getInt());

        this.setArithmeticFlags(this.a);
    }

    ldaZeroPage(zpAddr: Byte) {
        this.a.setInt(this.mem.getInt(zpAddr.getInt()));

        this.setArithmeticFlags(this.a);
    }

    ldaZeroPageX(zpAddr: Byte) {
        this.a.setInt(this.mem.getInt((zpAddr.getInt() + this.x.getInt()) % 256));

        this.setArithmeticFlags(this.a);
    }

    ldaAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.a);
    }

    ldaAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem.getInt(this.addByteToWord(address, this.x)));

        this.setArithmeticFlags(this.a);
    }

    ldaAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem.getInt(this.addByteToWord(address, this.y)));

        this.setArithmeticFlags(this.a);
    }

    ldaIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte((zpAddr.getInt() + this.x.getInt()) % 256);
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + this.x.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.a);
    }

    ldaIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte(zpAddr.getInt());
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.mem.getInt(this.addByteToWord(address, this.y)));

        this.setArithmeticFlags(this.a);
    }

    ldxImmediate(value: Byte) {
        this.x.setInt(value.getInt());

        this.setArithmeticFlags(this.x);
    }

    ldxZeroPage(zpAddr: Byte) {
        this.x.setInt(this.mem.getInt(zpAddr.getInt()));

        this.setArithmeticFlags(this.x);
    }

    ldxZeroPageY(zpAddr: Byte) {
        this.x.setInt(this.mem.getInt((zpAddr.getInt() + this.y.getInt()) % 256));

        this.setArithmeticFlags(this.x);
    }

    ldxAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.x.setInt(this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.x);
    }

    ldxAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.x.setInt(this.mem.getInt(this.addByteToWord(address, this.y)));

        this.setArithmeticFlags(this.x);
    }

    ldyImmediate(value: Byte) {
        this.y.setInt(value.getInt());

        this.setArithmeticFlags(this.y);
    }

    ldyZeroPage(zpAddr: Byte) {
        this.y.setInt(this.mem.getInt(zpAddr.getInt()));

        this.setArithmeticFlags(this.y);
    }

    ldyZeroPageX(zpAddr: Byte) {
        this.y.setInt(this.mem.getInt((zpAddr.getInt() + this.x.getInt()) % 256));

        this.setArithmeticFlags(this.y);
    }

    ldyAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.y.setInt(this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.y);
    }

    ldyAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.y.setInt(this.mem.getInt(this.addByteToWord(address, this.x)));

        this.setArithmeticFlags(this.y);
    }

    staZeroPage(zpAddr: Byte) {
        this.mem.getByte(zpAddr.getInt()).setInt(this.a.getInt());
    }

    staZeroPageX(zpAddr: Byte) {
        this.mem.getByte((zpAddr.getInt() + this.x.getInt()) % 256).setInt(this.a.getInt());
    }

    staAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem.setInt(address.getInt(), this.a.getInt());
    }

    staAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem.setInt(this.addByteToWord(address, this.x), this.a.getInt());
    }

    staAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem.setInt(this.addByteToWord(address, this.y), this.a.getInt());
    }

    staIndexedIndirect(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte((zpAddr.getInt() + this.x.getInt()) % 256);
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + this.x.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.mem.setInt(address.getInt(), this.a.getInt());
    }

    staIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte(zpAddr.getInt());
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.mem.setInt(this.addByteToWord(address, this.y), this.a.getInt());
    }

    stxZeroPage(zpAddr: Byte) {
        this.mem.getByte(zpAddr.getInt()).setInt(this.x.getInt());
    }

    stxZeroPageY(zpAddr: Byte) {
        this.mem.setInt((zpAddr.getInt() + this.y.getInt()) % 256, this.x.getInt());
    }

    stxAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem.setInt(address.getInt(), this.x.getInt());
    }

    styZeroPage(zpAddr: Byte) {
        this.mem.getByte(zpAddr.getInt()).setInt(this.y.getInt());
    }

    styZeroPageX(zpAddr: Byte) {
        this.mem.getByte((zpAddr.getInt() + this.x.getInt()) % 256).setInt(this.y.getInt());
    }

    styAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.mem.setInt(address.getInt(), this.y.getInt());
    }

    incZeroPage(zpAddr: Byte) {
        this.incrementByte(this.mem.getByte(zpAddr.getInt()));

        this.setArithmeticFlags(this.mem.getByte(zpAddr.getInt()));
    }

    incZeroPageX(zpAddr: Byte) {
        const address = (zpAddr.getInt() + this.x.getInt()) % 256;

        this.incrementByte(this.mem.getByte(address));

        this.setArithmeticFlags(this.mem.getByte(address));
    }

    incAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.incrementByte(this.mem.getByte(address.getInt()));

        this.setArithmeticFlags(this.mem.getByte(address.getInt()));
    }

    incAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);
        const addressX = this.addByteToWord(address, this.x);

        this.incrementByte(this.mem.getByte(addressX));

        this.setArithmeticFlags(this.mem.getByte(addressX));
    }

    decZeroPage(zpAddr: Byte) {
        this.decrementByte(this.mem.getByte(zpAddr.getInt()));

        this.setArithmeticFlags(this.mem.getByte(zpAddr.getInt()));
    }

    decZeroPageX(zpAddr: Byte) {
        const address = (zpAddr.getInt() + this.x.getInt()) % 256;
        this.decrementByte(this.mem.getByte(address));

        this.setArithmeticFlags(this.mem.getByte(address));
    }

    decAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.decrementByte(this.mem.getByte(address.getInt()));

        this.setArithmeticFlags(this.mem.getByte(address.getInt()));
    }

    decAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);
        const addressX = this.addByteToWord(address, this.x);

        this.decrementByte(this.mem.getByte(addressX));

        this.setArithmeticFlags(this.mem.getByte(addressX));
    }

    inx() {
        this.incrementByte(this.x);

        this.setArithmeticFlags(this.x);
    }

    iny() {
        this.incrementByte(this.y);

        this.setArithmeticFlags(this.y);
    }

    dex() {
        this.decrementByte(this.x);

        this.setArithmeticFlags(this.x);
    }

    dey() {
        this.decrementByte(this.y);

        this.setArithmeticFlags(this.y);
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
        const flags = this.addByteToAccumulator(this.mem.getByte(zpAddr.getInt()));

        this.setAddSubstractFlags(flags);
    }

    adcZeroPageX(zpAddr: Byte) {
        const flags = this.addByteToAccumulator(this.mem.getByte((zpAddr.getInt() + this.x.getInt()) % 256));

        this.setAddSubstractFlags(flags);
    }

    adcAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem.getByte(address.getInt()));

        this.setAddSubstractFlags(flags);
    }

    adcAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem.getByte(this.addByteToWord(address, this.x)));

        this.setAddSubstractFlags(flags);
    }

    adcAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem.getByte(this.addByteToWord(address, this.y)));

        this.setAddSubstractFlags(flags);
    }

    adcIndexedIndirect(zpAddr: Byte) {
        const addressZp = zpAddr.getInt() + this.x.getInt();

        const byteLow: Byte = this.mem.getByte(addressZp % 256);
        const byteHigh: Byte = this.mem.getByte((addressZp + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem.getByte(address.getInt()));

        this.setAddSubstractFlags(flags);
    }

    adcIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte(zpAddr.getInt());
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        const flags = this.addByteToAccumulator(this.mem.getByte(this.addByteToWord(address, this.y)));

        this.setAddSubstractFlags(flags);
    }

    sbcImmediate(value: Byte) {
        const flags = this.substractByteFromAccumulator(value);

        this.setAddSubstractFlags(flags);
    }

    sbcZeroPage(zpAddr: Byte) {
        const flags = this.substractByteFromAccumulator(this.mem.getByte(zpAddr.getInt()));

        this.setAddSubstractFlags(flags);
    }

    sbcZeroPageX(zpAddr: Byte) {
        const flags = this.substractByteFromAccumulator(this.mem.getByte((zpAddr.getInt() + this.x.getInt()) % 256));

        this.setAddSubstractFlags(flags);
    }

    sbcAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem.getByte(address.getInt()));

        this.setAddSubstractFlags(flags);
    }

    sbcAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem.getByte(this.addByteToWord(address, this.x)));

        this.setAddSubstractFlags(flags);
    }

    sbcAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem.getByte(this.addByteToWord(address, this.y)));

        this.setAddSubstractFlags(flags);
    }

    sbcIndexedIndirect(zpAddr: Byte) {
        const addressZp = zpAddr.getInt() + this.x.getInt();

        const byteLow: Byte = this.mem.getByte(addressZp % 256);
        const byteHigh: Byte = this.mem.getByte((addressZp + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem.getByte(address.getInt()));

        this.setAddSubstractFlags(flags);
    }

    sbcIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte(zpAddr.getInt());
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        const flags = this.substractByteFromAccumulator(this.mem.getByte(this.addByteToWord(address, this.y)));

        this.setAddSubstractFlags(flags);
    }

    cmpImmediate(operand: Byte) {
        this.setCompareFlags(this.a, operand);
    }

    cmpZeroPage(zpAddr: Byte) {
        this.setCompareFlags(this.a, this.mem.getByte(zpAddr.getInt()));
    }

    cmpZeroPageX(zpAddr: Byte) {
        this.setCompareFlags(this.a, this.mem.getByte((zpAddr.getInt() + this.x.getInt()) % 256));
    }

    cmpAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.setCompareFlags(this.a, this.mem.getByte(address.getInt()));
    }

    cmpAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);
        this.setCompareFlags(this.a, this.mem.getByte(this.addByteToWord(address, this.x)));
    }

    cmpAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.setCompareFlags(this.a, this.mem.getByte(this.addByteToWord(address, this.y)));
    }

    cmpIndexedIndirect(zpAddr: Byte) {
        const addressZp = zpAddr.getInt() + this.x.getInt();

        const byteLow: Byte = this.mem.getByte(addressZp % 256);
        const byteHigh: Byte = this.mem.getByte((addressZp + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.setCompareFlags(this.a, this.mem.getByte(address.getInt()));
    }

    cmpIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte(zpAddr.getInt());
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.setCompareFlags(this.a, this.mem.getByte(this.addByteToWord(address, this.y)));
    }

    cpxImmediate(operand: Byte) {
        this.setCompareFlags(this.x, operand);
    }

    cpxZeroPage(zpAddr: Byte) {
        this.setCompareFlags(this.x, this.mem.getByte(zpAddr.getInt()));
    }

    cpxAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.setCompareFlags(this.x, this.mem.getByte(address.getInt()));
    }

    cpyImmediate(operand: Byte) {
        this.setCompareFlags(this.y, operand);
    }

    cpyZeroPage(zpAddr: Byte) {
        this.setCompareFlags(this.y, this.mem.getByte(zpAddr.getInt()));
    }

    cpyAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.setCompareFlags(this.y, this.mem.getByte(address.getInt()));
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
        if (!this.p.getOverflowFlag()) {
            this.addToWord(this.pc, operand.getAsSignedInt());
        }
    }

    bvs(operand: Byte) {
        if (this.p.getOverflowFlag()) {
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

        this.pc.lowByte.setInt(this.mem.getInt(address.getInt()));
        this.pc.highByte.setInt(this.mem.getInt(address.getInt() + 1));
    }

    brk() {
        // pc is already incr by 3 through fetching
        // reduce by 1 for compatibility
        this.decrementWord(this.pc);

        // skip to next instruction for return address
        this.incrementWord(this.pc);
        this.incrementWord(this.pc);

        this.pushOnStack(this.pc.highByte.getInt());
        this.pushOnStack(this.pc.lowByte.getInt());

        const pWithBreakFlag = new ProcessorStatusRegister(this.p.getInt());
        pWithBreakFlag.setBreakFlag(true);

        this.pushOnStack(pWithBreakFlag.getInt()); // Break flag is always set

        this.p.setInterruptFlag(true);

        this.pc.lowByte.setInt(this.mem.getInt(parseInt('fffe', 16)));
        this.pc.highByte.setInt(this.mem.getInt(parseInt('ffff', 16)));
    }

    irq() {
        // this is not an opcode but the procedure that runs when a hardwarre interrupt is set

        this.pushOnStack(this.pc.highByte.getInt());
        this.pushOnStack(this.pc.lowByte.getInt());

        const pWithoutBreakFlag = new ProcessorStatusRegister(this.p.getInt());
        pWithoutBreakFlag.setBreakFlag(false);

        /*         console.log(this.pc.highByte.getAsHexString());
        console.log(this.pc.lowByte.getAsHexString());
        console.log(pWithoutBreakFlag.getAsHexString()); */

        this.pushOnStack(pWithoutBreakFlag.getInt());

        this.p.setInterruptFlag(true);

        this.pc.lowByte.setInt(this.mem.getInt(parseInt('fffe', 16)));
        this.pc.highByte.setInt(this.mem.getInt(parseInt('ffff', 16)));
    }

    rti() {
        this.p.setInt(this.pullFromStack());

        this.p.setExpansionBit();
        this.p.setBreakFlag(false);

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
        const pWithBreakFlag = new ProcessorStatusRegister(this.p.getInt());
        pWithBreakFlag.setBreakFlag(true);

        this.pushOnStack(pWithBreakFlag.getInt());
    }

    plp() {
        this.p.setInt(this.pullFromStack());

        this.p.setExpansionBit();
        this.p.setBreakFlag(false);
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
        this.a.setInt(this.a.getInt() & this.mem.getInt(zpAddr.getInt()));

        this.setArithmeticFlags(this.a);
    }

    andZeroPageX(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() & this.mem.getInt((zpAddr.getInt() + this.x.getInt()) % 256));

        this.setArithmeticFlags(this.a);
    }

    andAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.a);
    }

    andAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem.getInt(this.addByteToWord(address, this.x)));

        this.setArithmeticFlags(this.a);
    }

    andAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem.getInt(this.addByteToWord(address, this.y)));

        this.setArithmeticFlags(this.a);
    }

    andIndexedIndirect(zpAddr: Byte) {
        const addressZp = zpAddr.getInt() + this.x.getInt();

        const byteLow: Byte = this.mem.getByte(addressZp % 256);
        const byteHigh: Byte = this.mem.getByte((addressZp + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.a);
    }

    andIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte(zpAddr.getInt());
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() & this.mem.getInt(this.addByteToWord(address, this.y)));

        this.setArithmeticFlags(this.a);
    }

    oraImmediate(value: Byte) {
        this.a.setInt(this.a.getInt() | value.getInt());

        this.setArithmeticFlags(this.a);
    }

    oraZeroPage(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() | this.mem.getInt(zpAddr.getInt()));

        this.setArithmeticFlags(this.a);
    }

    oraZeroPageX(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() | this.mem.getInt((zpAddr.getInt() + this.x.getInt()) % 256));

        this.setArithmeticFlags(this.a);
    }

    oraAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.a);
    }

    oraAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem.getInt(this.addByteToWord(address, this.x)));

        this.setArithmeticFlags(this.a);
    }

    oraAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem.getInt(this.addByteToWord(address, this.y)));

        this.setArithmeticFlags(this.a);
    }

    oraIndexedIndirect(zpAddr: Byte) {
        const addressZp = zpAddr.getInt() + this.x.getInt();

        const byteLow: Byte = this.mem.getByte(addressZp % 256);
        const byteHigh: Byte = this.mem.getByte((addressZp + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.a);
    }

    oraIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte(zpAddr.getInt());
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() | this.mem.getInt(this.addByteToWord(address, this.y)));

        this.setArithmeticFlags(this.a);
    }

    eorImmediate(value: Byte) {
        this.a.setInt(this.a.getInt() ^ value.getInt());

        this.setArithmeticFlags(this.a);
    }

    eorZeroPage(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() ^ this.mem.getInt(zpAddr.getInt()));

        this.setArithmeticFlags(this.a);
    }

    eorZeroPageX(zpAddr: Byte) {
        this.a.setInt(this.a.getInt() ^ this.mem.getInt((zpAddr.getInt() + this.x.getInt()) % 256));

        this.setArithmeticFlags(this.a);
    }

    eorAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.a);
    }

    eorAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem.getInt(this.addByteToWord(address, this.x)));

        this.setArithmeticFlags(this.a);
    }

    eorAbsoluteY(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem.getInt(this.addByteToWord(address, this.y)));

        this.setArithmeticFlags(this.a);
    }

    eorIndexedIndirect(zpAddr: Byte) {
        const addressZp = zpAddr.getInt() + this.x.getInt();

        const byteLow: Byte = this.mem.getByte(addressZp % 256);
        const byteHigh: Byte = this.mem.getByte((addressZp + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem.getInt(address.getInt()));

        this.setArithmeticFlags(this.a);
    }

    eorIndirectIndexed(zpAddr: Byte) {
        const byteLow: Byte = this.mem.getByte(zpAddr.getInt());
        const byteHigh: Byte = this.mem.getByte((zpAddr.getInt() + 1) % 256);

        const address = new Word(byteLow, byteHigh);

        this.a.setInt(this.a.getInt() ^ this.mem.getInt(this.addByteToWord(address, this.y)));

        this.setArithmeticFlags(this.a);
    }

    aslAccumulator() {
        const carry = this.shiftLeftByte(this.a);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a);
    }

    aslZeroPage(zpAddr: Byte) {
        const carry = this.shiftLeftByte(this.mem.getByte(zpAddr.getInt()));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(zpAddr.getInt()));
    }

    aslZeroPageX(zpAddr: Byte) {
        const addressZp = (zpAddr.getInt() + this.x.getInt()) % 256;

        const carry = this.shiftLeftByte(this.mem.getByte(addressZp));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(addressZp));
    }

    aslAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.shiftLeftByte(this.mem.getByte(address.getInt()));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(address.getInt()));
    }

    aslAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);
        const addressX = this.addByteToWord(address, this.x);

        const carry = this.shiftLeftByte(this.mem.getByte(addressX));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(addressX));
    }

    lsrAccumulator() {
        const carry = this.shiftRightByte(this.a);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a);
    }

    lsrZeroPage(zpAddr: Byte) {
        const carry = this.shiftRightByte(this.mem.getByte(zpAddr.getInt()));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(zpAddr.getInt()));
    }

    lsrZeroPageX(zpAddr: Byte) {
        const address = (zpAddr.getInt() + this.x.getInt()) % 256;
        const carry = this.shiftRightByte(this.mem.getByte(address));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(address));
    }

    lsrAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.shiftRightByte(this.mem.getByte(address.getInt()));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(address.getInt()));
    }

    lsrAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);
        const addressX = this.addByteToWord(address, this.x);

        const carry = this.shiftRightByte(this.mem.getByte(addressX));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(addressX));
    }

    rolAccumulator() {
        const carry = this.rotateLeftByte(this.a);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a);
    }

    rolZeroPage(zpAddr: Byte) {
        const carry = this.rotateLeftByte(this.mem.getByte(zpAddr.getInt()));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(zpAddr.getInt()));
    }

    rolZeroPageX(zpAddr: Byte) {
        const address = (zpAddr.getInt() + this.x.getInt()) % 256;
        const carry = this.rotateLeftByte(this.mem.getByte(address));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(address));
    }

    rolAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.rotateLeftByte(this.mem.getByte(address.getInt()));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(address.getInt()));
    }

    rolAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);
        const addressX = this.addByteToWord(address, this.x);

        const carry = this.rotateLeftByte(this.mem.getByte(addressX));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(addressX));
    }

    rorAccumulator() {
        const carry = this.rotateRightByte(this.a);

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.a);
    }

    rorZeroPage(zpAddr: Byte) {
        const carry = this.rotateRightByte(this.mem.getByte(zpAddr.getInt()));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(zpAddr.getInt()));
    }

    rorZeroPageX(zpAddr: Byte) {
        const address = (zpAddr.getInt() + this.x.getInt()) % 256;
        const carry = this.rotateRightByte(this.mem.getByte(address));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(address));
    }

    rorAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        const carry = this.rotateRightByte(this.mem.getByte(address.getInt()));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(address.getInt()));
    }

    rorAbsoluteX(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);
        const addressX = this.addByteToWord(address, this.x);

        const carry = this.rotateRightByte(this.mem.getByte(addressX));

        this.p.setCarryFlag(carry);
        this.setArithmeticFlags(this.mem.getByte(addressX));
    }

    bitZeroPage(zpAddr: Byte) {
        this.p.setNegativeFlag(this.mem.getByte(zpAddr.getInt()).getBitByIndex(7));
        this.p.setOverflowFlag(this.mem.getByte(zpAddr.getInt()).getBitByIndex(6));

        this.p.setZeroFlag((this.a.getInt() & this.mem.getInt(zpAddr.getInt())) === 0 ? true : false);
    }

    bitAbsolute(byteLow: Byte, byteHigh: Byte) {
        const address = new Word(byteLow, byteHigh);

        this.p.setNegativeFlag(this.mem.getByte(address.getInt()).getBitByIndex(7));
        this.p.setOverflowFlag(this.mem.getByte(address.getInt()).getBitByIndex(6));

        this.p.setZeroFlag((this.a.getInt() & this.mem.getInt(address.getInt())) === 0 ? true : false);
    }

    /* === COMMAND HELPER === */

    setArithmeticFlags(byte: Byte) {
        this.p.setNegativeFlag(byte.getInt() > 127);
        this.p.setZeroFlag(byte.getInt() === 0);
    }

    setAddSubstractFlags({ carry, overflow, negative, zero }: { carry: boolean; overflow: boolean; negative: boolean; zero: boolean }) {
        this.p.setCarryFlag(carry);
        this.p.setOverflowFlag(overflow);
        this.p.setNegativeFlag(negative);
        this.p.setZeroFlag(zero);
    }

    setCompareFlags(register: Byte, value: Byte) {
        let result = register.getAsSignedInt() - value.getAsSignedInt();
        result = result > 127 ? result - 256 : result;
        result = result < -128 ? result + 256 : result;

        this.p.setNegativeFlag(result < 0);
        this.p.setZeroFlag(register.getInt() === value.getInt());
        this.p.setCarryFlag(register.getInt() >= value.getInt());
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
        const value = byte.getInt().toString(2).padStart(8, '0');
        const bitsWithCarry = `${value}${carry}`;
        const newCarry = bitsWithCarry.substring(0, 1) === '1' ? true : false;
        const newValue = parseInt(bitsWithCarry.substring(1, 9), 2);

        byte.setInt(newValue);

        return newCarry;
    }

    rotateRightByte(byte: Byte) {
        // >> (old)C-B-B-B-B-B-B-B-B-C(new)
        const carry = this.p.getCarryFlag() ? '1' : '0';
        const value = byte.getInt().toString(2).padStart(8, '0');
        const bitsWithCarry = `${carry}${value}`;
        const newCarry = bitsWithCarry.substring(8, 9) === '1' ? true : false;
        const newValue = parseInt(bitsWithCarry.substring(0, 8), 2);

        byte.setInt(newValue);

        return newCarry;
    }

    addByteToAccumulator(value: Byte) {
        let carry;
        let overflow;
        let negative;

        if (this.p.getDecimalFlag()) {
            /*
            Reference: http://www.6502.org/tutorials/decimal_mode.html#A

            6502
            ----
            Seq. 1 => A, C
            Seq. 2 => N, V
            Z binary

            Seq. 1:

            1a. AL = (A & $0F) + (B & $0F) + C
            1b. If AL >= $0A, then AL = ((AL + $06) & $0F) + $10
            1c. A = (A & $F0) + (B & $F0) + AL
            1d. Note that A can be >= $100 at this point
            1e. If (A >= $A0), then A = A + $60
            1f. The accumulator result is the lower 8 bits of A
            1g. The carry result is 1 if A >= $100, and is 0 if A < $100

            Seq. 2:

            2a. AL = (A & $0F) + (B & $0F) + C
            2b. If AL >= $0A, then AL = ((AL + $06) & $0F) + $10
            2c. A = (A & $F0) + (B & $F0) + AL, using signed (twos complement) arithmetic
            2e. The N flag result is 1 if bit 7 of A is 1, and is 0 if bit 7 if A is 0
            2f. The V flag result is 1 if A < -128 or A > 127, and is 0 if -128 <= A <= 127

            */

            let temp;
            let a1;
            let a2;
            let a = this.a.getInt();
            const b = value.getInt();
            const c = this.p.getCarryFlag() ? 1 : 0;

            temp = (a & parseInt('0F', 16)) + (b & parseInt('0F', 16)) + c; // 1a
            if (temp >= parseInt('0A', 16)) temp = ((temp + parseInt('06', 16)) & parseInt('0F', 16)) + parseInt('10', 16); // 1b

            a1 = (a & parseInt('F0', 16)) + (b & parseInt('F0', 16)) + temp; // 1c
            if (a1 >= parseInt('A0', 16)) a1 = a1 + parseInt('60', 16); // 1e

            const a1Mod = a1 % 256;
            this.a.setInt(a1Mod); // 1f

            carry = a1 >= parseInt('100', 16) ? true : false; // 1g

            const aSigned = a > 127 ? a - 256 : a;
            const bSigned = b > 127 ? b - 256 : b;
            a2 = (aSigned & parseInt('F0', 16)) + (bSigned & parseInt('F0', 16)) + temp; // 2c

            const a2Mod = a2 > 127 ? (a2 % 256) - 256 : a2;

            negative = a2 > 127 && a2 <= 255 ? true : false; // 2e
            //overflow = a2 < -128 && a2 > 127  ? true : false; // 2f
            overflow = a1 <= 127 || (a1 >= 256 && a1 <= 451) || (a1 >= 500 && a1 <= 587) ? false : true; // 2f
        } else {
            const carryBit = this.p.getCarryFlag() ? 1 : 0;

            const result = this.a.getInt() + value.getInt() + carryBit;
            const resultSigned = this.a.getAsSignedInt() + value.getAsSignedInt() + carryBit;

            this.a.setInt(result);

            carry = result > 255 ? true : false; // int overflow
            negative = (resultSigned < 0 && resultSigned >= -128) || resultSigned > 127 ? true : false;
            overflow = resultSigned < -128 || resultSigned > 127 ? true : false; // signed int overflow
        }

        const zero = this.a.getInt() === 0 ? true : false;

        return { carry, overflow, negative, zero };
    }

    substractByteFromAccumulator(value: Byte) {
        const carryBit = this.p.getCarryFlag() ? 1 : 0;

        const result = this.a.getInt() - value.getInt() - 1 + carryBit;

        const resultSigned = this.a.getAsSignedInt() - value.getAsSignedInt() - 1 + carryBit;

        const carry = result >= 0 ? true : false; // true = no borrow; false = borrow
        const negative = resultSigned > 127 ? true : false;
        const overflow = resultSigned < -128 || resultSigned > 127 ? true : false; // signed int overflow
        const zero = this.a.getInt() === 0 ? true : false;

        this.a.setInt(result);

        return { carry, overflow, negative, zero };
    }

    pushOnStack(value: number) {
        this.mem.setInt(256 + this.s.getInt(), value);
        this.decrementByte(this.s);
    }

    pullFromStack() {
        this.incrementByte(this.s);
        return this.mem.getInt(256 + this.s.getInt());
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

    addByteToWord(word: Word, byte: Byte) {
        let value = word.getInt() + byte.getInt();
        return value % 65536;
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
