export default class Reference {
    instructionShort: string;
    instructionLong: string;
    addressing: string;
    assembly: string;
    opc: string;
    bytes: number;
    cycles: number;

    constructor(
        instructionShort: string,
        instructionLong: string,
        addressing: string,
        assembly: string,
        opc: string,
        bytes: number,
        cycles: number
    ) {
        this.instructionShort = instructionShort;
        this.instructionLong = instructionLong;
        this.addressing = addressing;
        this.assembly = assembly;
        this.opc = opc;
        this.bytes = bytes;
        this.cycles = cycles;
    }
}

export const references = [
    new Reference('ADC', 'ADd with Carry', 'immediate', 'ADC #$nn', '69', 2, 2),
    new Reference('ADC', 'ADd with Carry', 'zeropage', 'ADC $ll', '65', 2, 3),
    new Reference('ADC', 'ADd with Carry', 'zeropage,X', 'ADC $ll,X', '75', 2, 4),
    new Reference('ADC', 'ADd with Carry', 'absolute', 'ADC $hhll', '6D', 3, 4),
    new Reference('ADC', 'ADd with Carry', 'absolute,X', 'ADC $hhll,X', '7D', 3, 4),
    new Reference('ADC', 'ADd with Carry', 'absolute,Y', 'ADC $hhll,Y', '79', 3, 4),
    new Reference('ADC', 'ADd with Carry', '(indirect,X)', 'ADC ($ll,X)', '61', 2, 6),
    new Reference('ADC', 'ADd with Carry', '(indirect),Y', 'ADC ($ll),Y', '71', 2, 5),

    new Reference('AND', 'AND with Accumulator', 'immediate', 'AND #$nn', '29', 2, 2),
    new Reference('AND', 'AND with Accumulator', 'zeropage', 'AND $ll', '25', 2, 3),
    new Reference('AND', 'AND with Accumulator', 'zeropage,X', 'AND $ll,X', '35', 2, 4),
    new Reference('AND', 'AND with Accumulator', 'absolute', 'AND $hhll', '2D', 3, 4),
    new Reference('AND', 'AND with Accumulator', 'absolute,X', 'AND $hhll,X', '3D', 3, 4),
    new Reference('AND', 'AND with Accumulator', 'absolute,Y', 'AND $hhll,Y', '39', 3, 4),
    new Reference('AND', 'AND with Accumulator', '(indirect,X)', 'AND ($ll,X)', '21', 2, 6),
    new Reference('AND', 'AND with Accumulator', '(indirect),Y', 'AND ($ll),Y', '31', 2, 5),

    new Reference('ASL', 'Arithmetic Shift Left', 'accumulator', 'ASL', '0A', 1, 2),
    new Reference('ASL', 'Arithmetic Shift Left', 'zeropage', 'ASL $ll', '06', 2, 5),
    new Reference('ASL', 'Arithmetic Shift Left', 'zeropage,X', 'ASL $ll,X', '16', 2, 6),
    new Reference('ASL', 'Arithmetic Shift Left', 'absolute', 'ASL $hhll', '0E', 3, 6),
    new Reference('ASL', 'Arithmetic Shift Left', 'absolute,X', 'ASL $hhll,X', '1E', 3, 7),

    new Reference('BCC', 'Branch on Carry Clear', 'relative', 'BCC $hhll', '90', 2, 2),

    new Reference('BCS', 'Branch on Carry Set', 'relative', 'BCS $hhll', 'B0', 2, 2),

    new Reference('BEQ', 'Branch on EQual', 'relative', 'BEQ $hhll', 'F0', 2, 2),

    new Reference('BIT', 'BIT test', 'zeropage', 'BIT $ll', '24', 2, 3),
    new Reference('BIT', 'BIT test', 'absolute', 'BIT $hhll', '2C', 3, 4),

    new Reference('BMI', 'Branch on MInus', 'relative', 'BMI $hhll', '30', 2, 2),

    new Reference('BNE', 'Branch on Not Equal', 'relative', 'BNE $hhll', 'D0', 2, 2),

    new Reference('BPL', 'Branch on PLus', 'relative', 'BPL $hhll', '10', 2, 2),

    new Reference('BRK', 'BReaK', 'implicit', 'BRK $hhll', '00', 1, 7),

    new Reference('BVC', 'Branch on oVerflow Clear', 'relative', 'BVC $hhll', '50', 2, 2),

    new Reference('BVS', 'Branch on oVerflow Set', 'relative', 'BVS $hhll', '70', 2, 2),

    new Reference('CLC', 'CLear Carry flag', 'implicit', 'CLC', '18', 1, 2),
    new Reference('CLD', 'CLear Decimal flag', 'implicit', 'CLD', 'D8', 1, 2),
    new Reference('CLI', 'CLear Interrupt flag', 'implicit', 'CLI', '58', 1, 2),
    new Reference('CLV', 'CLear oVerflow flag', 'implicit', 'CLV', 'B8', 1, 2),

    new Reference('CMP', 'CoMPare with Accumulator', 'immediate', 'CMP #$nn', 'C9', 2, 2),
    new Reference('CMP', 'CoMPare with Accumulator', 'zeropage', 'CMP $ll', 'C5', 2, 3),
    new Reference('CMP', 'CoMPare with Accumulator', 'zeropage,X', 'CMP $ll,X', 'D5', 2, 4),
    new Reference('CMP', 'CoMPare with Accumulator', 'absolute', 'CMP $hhll', 'CD', 3, 4),
    new Reference('CMP', 'CoMPare with Accumulator', 'absolute,X', 'CMP $hhll,X', 'DD', 3, 4),
    new Reference('CMP', 'CoMPare with Accumulator', 'absolute,Y', 'CMP $hhll,Y', 'D9', 3, 4),
    new Reference('CMP', 'CoMPare with Accumulator', '(indirect,X)', 'CMP ($ll,X)', 'C1', 2, 6),
    new Reference('CMP', 'CoMPare with Accumulator', '(indirect),Y', 'CMP ($ll),Y', 'D1', 2, 5),

    new Reference('CPX', 'ComPare with X-Register', 'immediate', 'CPX #$nn', 'E0', 2, 2),
    new Reference('CPX', 'ComPare with X-Register', 'zeropage', 'CPX $ll', 'E4', 2, 3),
    new Reference('CPX', 'ComPare with X-Register', 'absolute', 'CPX $hhll', 'EC', 3, 4),

    new Reference('CPY', 'ComPare with Y-Register', 'immediate', 'CPY #$nn', 'C0', 2, 2),
    new Reference('CPY', 'ComPare with Y-Register', 'zeropage', 'CPY $ll', 'C4', 2, 3),
    new Reference('CPY', 'ComPare with Y-Register', 'absolute', 'CPY $hhll', 'CC', 3, 4),

    new Reference('DEC', 'DECrement Memory', 'zeropage', 'DEC $ll', 'C6', 2, 5),
    new Reference('DEC', 'DECrement Memory', 'zeropage,X', 'DEC $ll,X', 'D6', 2, 6),
    new Reference('DEC', 'DECrement Memory', 'absolute', 'DEC $hhll', 'CE', 3, 6),
    new Reference('DEC', 'DECrement Memory', 'absolute,X', 'DEC $hhll,X', 'DE', 3, 7),

    new Reference('DEX', 'DEcrement X-Register', 'implicit', 'DEX', 'CA', 1, 2),

    new Reference('DEY', 'DEcrement Y-Register', 'implicit', 'DEY', '88', 1, 2),

    new Reference('EOR', 'Exclusive OR with Accumulator', 'immediate', 'EOR #$nn', '49', 2, 2),
    new Reference('EOR', 'Exclusive OR with Accumulator', 'zeropage', 'EOR $ll', '45', 2, 3),
    new Reference('EOR', 'Exclusive OR with Accumulator', 'zeropage,X', 'EOR $ll,X', '55', 2, 4),
    new Reference('EOR', 'Exclusive OR with Accumulator', 'absolute', 'EOR $hhll', '4D', 3, 4),
    new Reference('EOR', 'Exclusive OR with Accumulator', 'absolute,X', 'EOR $hhll,X', '5D', 3, 4),
    new Reference('EOR', 'Exclusive OR with Accumulator', 'absolute,Y', 'EOR $hhll,Y', '59', 3, 4),
    new Reference('EOR', 'Exclusive OR with Accumulator', '(indirect,X)', 'EOR ($ll,X)', '41', 2, 6),
    new Reference('EOR', 'Exclusive OR with Accumulator', '(indirect),Y', 'EOR ($ll),Y', '51', 2, 5),

    new Reference('INC', 'INCrement Memory', 'zeropage', 'INC $ll', 'E6', 2, 5),
    new Reference('INC', 'INCrement Memory', 'zeropage,X', 'INC $ll,X', 'F6', 2, 6),
    new Reference('INC', 'INCrement Memory', 'absolute', 'INC $hhll', 'EE', 3, 6),
    new Reference('INC', 'INCrement Memory', 'absolute,X', 'INC $hhll,X', 'FE', 3, 7),

    new Reference('INX', 'INcrement X-Register', 'implicit', 'INX', 'E8', 1, 2),

    new Reference('INY', 'INcrement Y-Register', 'implicit', 'INY', 'C8', 1, 2),

    new Reference('JMP', 'JuMP to $hhll', 'absolute', 'JMP $hhll', '4C', 3, 3),
    new Reference('JMP', 'JuMP to ($hhll)', 'indirect', 'JMP ($hhll)', '6C', 3, 5),

    new Reference('JSR', 'Jump to SubRoutine', 'absolute', 'JSR $hhll', '20', 3, 6),

    new Reference('LDA', 'LoaD Accumulator', 'immediate', 'LDA #$nn', 'A9', 2, 2),
    new Reference('LDA', 'LoaD Accumulator', 'zeropage', 'LDA $ll', 'A5', 2, 3),
    new Reference('LDA', 'LoaD Accumulator', 'zeropage,X', 'LDA $ll,X', 'B5', 2, 4),
    new Reference('LDA', 'LoaD Accumulator', 'absolute', 'LDA $hhll', 'AD', 3, 4),
    new Reference('LDA', 'LoaD Accumulator', 'absolute,X', 'LDA $hhll,X', 'BD', 3, 4),
    new Reference('LDA', 'LoaD Accumulator', 'absolute,Y', 'LDA $hhll,Y', 'B9', 3, 4),
    new Reference('LDA', 'LoaD Accumulator', '(indirect,X)', 'LDA ($ll,X)', 'A1', 2, 6),
    new Reference('LDA', 'LoaD Accumulator', '(indirect),Y', 'LDA ($ll),Y', 'B1', 2, 5),

    new Reference('LDX', 'LoaD X-Register', 'immediate', 'LDX #$nn', 'A2', 2, 2),
    new Reference('LDX', 'LoaD X-Register', 'zeropage', 'LDX $ll', 'A6', 2, 3),
    new Reference('LDX', 'LoaD X-Register', 'zeropage,Y', 'LDX $ll,Y', 'B6', 2, 4),
    new Reference('LDX', 'LoaD X-Register', 'absolute', 'LDX $hhll', 'AE', 3, 4),
    new Reference('LDX', 'LoaD X-Register', 'absolute,Y', 'LDX $hhll,Y', 'BE', 3, 4),

    new Reference('LDY', 'LoaD Y-Register', 'immediate', 'LDY #$nn', 'A0', 2, 2),
    new Reference('LDY', 'LoaD Y-Register', 'zeropage', 'LDY $ll', 'A4', 2, 3),
    new Reference('LDY', 'LoaD Y-Register', 'zeropage,X', 'LDY $ll,X', 'B4', 2, 4),
    new Reference('LDY', 'LoaD Y-Register', 'absolute', 'LDY $hhll', 'AC', 3, 4),
    new Reference('LDY', 'LoaD Y-Register', 'absolute,X', 'LDY $hhll,X', 'BC', 3, 4),

    new Reference('LSR', 'Logical Shift Right', 'accumulator', 'LSR', '4A', 1, 2),
    new Reference('LSR', 'Logical Shift Right', 'zeropage', 'LSR $ll', '46', 2, 5),
    new Reference('LSR', 'Logical Shift Right', 'zeropage,X', 'LSR $ll,X', '56', 2, 6),
    new Reference('LSR', 'Logical Shift Right', 'absolute', 'LSR $hhll', '4E', 3, 6),
    new Reference('LSR', 'Logical Shift Right', 'absolute,X', 'LSR $hhll,X', '5E', 3, 7),

    new Reference('NOP', 'No OPeration', 'implicit', 'NOP', 'EA', 1, 2),

    new Reference('ORA', 'OR with Accumulator', 'immediate', 'ORA #$nn', '09', 2, 2),
    new Reference('ORA', 'OR with Accumulator', 'zeropage', 'ORA $ll', '05', 2, 3),
    new Reference('ORA', 'OR with Accumulator', 'zeropage,X', 'ORA $ll,X', '15', 2, 4),
    new Reference('ORA', 'OR with Accumulator', 'absolute', 'ORA $hhll', '0D', 3, 4),
    new Reference('ORA', 'OR with Accumulator', 'absolute,X', 'ORA $hhll,X', '1D', 3, 4),
    new Reference('ORA', 'OR with Accumulator', 'absolute,Y', 'ORA $hhll,Y', '19', 3, 4),
    new Reference('ORA', 'OR with Accumulator', '(indirect,X)', 'ORA ($ll,X)', '01', 2, 6),
    new Reference('ORA', 'OR with Accumulator', '(indirect),Y', 'ORA ($ll),Y', '11', 2, 5),

    new Reference('PHA', 'PusH Accumulator on Stack', 'implicit', 'PHA', '48', 1, 3),

    new Reference('PHP', 'PusH Processor Status on Stack', 'implicit', 'PHP', '08', 1, 3),

    new Reference('PLA', 'PulL Accumulator from Stack', 'implicit', 'PLA', '68', 1, 4),

    new Reference('PLP', 'PulL Processor Status from Stack', 'implicit', 'PLP', '28', 1, 4),

    new Reference('ROL', 'ROtate Left', 'accumulator', 'ROL', '2A', 1, 2),
    new Reference('ROL', 'ROtate Left', 'zeropage', 'ROL $ll', '26', 2, 5),
    new Reference('ROL', 'ROtate Left', 'zeropage,X', 'ROL $ll,X', '36', 2, 6),
    new Reference('ROL', 'ROtate Left', 'absolute', 'ROL $hhll', '2E', 3, 6),
    new Reference('ROL', 'ROtate Left', 'absolute,X', 'ROL $hhll,X', '3E', 3, 7),

    new Reference('ROR', 'ROtate Right', 'accumulator', 'ROR', '6A', 1, 2),
    new Reference('ROR', 'ROtate Right', 'zeropage', 'ROR $ll', '66', 2, 5),
    new Reference('ROR', 'ROtate Right', 'zeropage,X', 'ROR $ll,X', '76', 2, 6),
    new Reference('ROR', 'ROtate Right', 'absolute', 'ROR $hhll', '6E', 3, 6),
    new Reference('ROR', 'ROtate Right', 'absolute,X', 'ROR $hhll,X', '7E', 3, 7),

    new Reference('RTI', 'ReTurn from Interrupt', 'implicit', 'RTI', '40', 1, 6),

    new Reference('RTS', 'ReTurn from Subroutine', 'implicit', 'RTS', '60', 1, 6),

    new Reference('SBC', 'SuBtract with Carry', 'immediate', 'SBC #$nn', 'E9', 2, 2),
    new Reference('SBC', 'SuBtract with Carry', 'zeropage', 'SBC $ll', 'E5', 2, 3),
    new Reference('SBC', 'SuBtract with Carry', 'zeropage,X', 'SBC $ll,X', 'F5', 2, 4),
    new Reference('SBC', 'SuBtract with Carry', 'absolute', 'SBC $hhll', 'ED', 3, 4),
    new Reference('SBC', 'SuBtract with Carry', 'absolute,X', 'SBC $hhll,X', 'FD', 3, 4),
    new Reference('SBC', 'SuBtract with Carry', 'absolute,Y', 'SBC $hhll,Y', 'F9', 3, 4),
    new Reference('SBC', 'SuBtract with Carry', '(indirect,X)', 'SBC ($ll,X)', 'E1', 2, 6),
    new Reference('SBC', 'SuBtract with Carry', '(indirect),Y', 'SBC ($ll),Y', 'F1', 2, 5),

    new Reference('SEC', 'SEt Carry flag', 'implicit', 'SEC', '38', 1, 2),

    new Reference('SED', 'SEt Decimal flag', 'implicit', 'SED', 'F8', 1, 2),

    new Reference('SEI', 'SEt Interrupt flag', 'implicit', 'SEI', '78', 1, 2),

    new Reference('STA', 'STore Accumulator', 'zeropage', 'STA $ll', '85', 2, 3),
    new Reference('STA', 'STore Accumulator', 'zeropage,X', 'STA $ll,X', '95', 2, 4),
    new Reference('STA', 'STore Accumulator', 'absolute', 'STA $hhll', '8D', 3, 4),
    new Reference('STA', 'STore Accumulator', 'absolute,X', 'STA $hhll,X', '9D', 3, 5),
    new Reference('STA', 'STore Accumulator', 'absolute,Y', 'STA $hhll,Y', '99', 3, 5),
    new Reference('STA', 'STore Accumulator', '(indirect,X)', 'STA ($ll,X)', '81', 2, 6),
    new Reference('STA', 'STore Accumulator', '(indirect),Y', 'STA ($ll),Y', '91', 2, 6),

    new Reference('STX', 'STore X-Register', 'zeropage', 'STX $ll', '86', 2, 3),
    new Reference('STX', 'STore X-Register', 'zeropage,Y', 'STX $ll,Y', '96', 2, 4),
    new Reference('STX', 'STore X-Register', 'absolute', 'STX $hhll', '8E', 3, 4),

    new Reference('STY', 'STore Y-Register', 'zeropage', 'STY $ll', '84', 2, 3),
    new Reference('STY', 'STore Y-Register', 'zeropage,X', 'STY $ll,X', '94', 2, 4),
    new Reference('STY', 'STore Y-Register', 'absolute', 'STY $hhll', '8C', 3, 4),

    new Reference('TAX', 'Transfer Accumulator to X-Register', 'implicit', 'TAX', 'AA', 1, 2),

    new Reference('TAY', 'Transfer Accumulator to Y-Register', 'implicit', 'TAY', 'A8', 1, 2),

    new Reference('TSX', 'Transfer Stackpointer to X-Register', 'implicit', 'TSX', 'BA', 1, 2),

    new Reference('TXA', 'Transfer X-Register to Accumulator', 'implicit', 'TXA', '8A', 1, 2),

    new Reference('TXS', 'Transfer X-Register to Stackpointer', 'implicit', 'TXS', '9A', 1, 2),

    new Reference('TYA', 'Transfer Y-Register to Accumulator', 'implicit', 'TYA', '98', 1, 2)
];
