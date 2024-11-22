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
    new Reference('LDA', 'LoaD Accumulator', 'immediate', 'LDA #$nn', 'A9', 2, 2),
    new Reference('STA', 'STore Accumulator', 'zeropage', 'STA $ll', '85', 2, 3),
    new Reference('INC', 'INCrement Memory', 'zeropage', 'INC $ll', 'E6', 2, 5),
    new Reference('JSR', 'Jump to SubRoutine', 'absolute', 'JSR $hhll', '20', 3, 6),
    new Reference('JMP', 'JuMP to $hhll', 'absolute', 'JMP $hhll', '4C', 3, 3),
    new Reference('CLC', 'CLear Carry flag', 'implicit', 'CLC', '18', 1, 2),
    new Reference('SEC', 'SEt Carry flag', 'implicit', 'SEC', '38', 1, 2),
    new Reference('SBC', 'SuBtract with Carry', 'immediate', 'SBC #$nn', 'E9', 2, 2),
    new Reference('RTS', 'ReTurn from Subroutine', 'implicit', 'RTS', '60', 1, 6)
];
