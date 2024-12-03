import * as fs from 'node:fs';
import Computer from '../src/logic/Computer.ts';
import { references } from '../src/logic/Reference.ts';

interface Test {
    name: string;
    initial: {
        pc: number;
        s: number;
        a: number;
        x: number;
        y: number;
        p: number;
        ram: [number, number][];
    };
    final: {
        pc: number;
        s: number;
        a: number;
        x: number;
        y: number;
        p: number;
        ram: [number, number][];
    };
    cycles: [number, number, string][];
}

references.forEach(reference => {
    const jsonString = fs.readFileSync(`../65x02/6502/v1/${reference.opc.toLowerCase()}.json`, 'utf-8');
    const data = JSON.parse(jsonString) as Test[];

    const skip = [
        '69',
        '65',
        '75',
        '6D',
        '7D',
        '79',
        '61',
        '71',
        '29',
        '25',
        '35',
        '2D',
        '3D',
        '39',
        '21',
        '31',
        '0A',
        '06',
        '16',
        '0E',
        '1E',
        '90',
        'B0',
        'F0',
        '24',
        '2C',
        '30',
        'D0',
        '10',
        '00',
        '50',
        '70',
        '18',
        'D8',
        '58',
        'B8',
        'C9',
        'C5',
        'D5',
        'CD',
        'DD',
        'D9',
        'C1',
        'D1',
        'E0',
        'E4',
        'EC',
        'C0',
        'C4',
        'CC',
        'C6',
        'D6',
        'CE',
        'DE',
        'CA',
        '88',
        '49',
        '45',
        '55',
        '4D',
        '5D',
        '59',
        '41',
        '51',
        'E6',
        'F6',
        'EE',
        'FE',
        'E8',
        'C8',
        '4C',
        '6C',
        '20',
        'A9',
        'A5',
        'B5',
        'AD',
        'BD',
        'B9',
        'A1',
        'B1',
        'A2',
        'A6',
        'B6',
        'AE',
        'BE',
        'A0',
        'A4',
        'B4',
        'AC',
        'BC',
        '4A',
        '46',
        '56',
        '4E',
        '5E',
        'EA',
        '09',
        '05',
        '15',
        '0D',
        '1D',
        '19',
        '01',
        '11',
        '48',
        '08',
        '68',
        '28',
        '2A',
        '26',
        '36',
        '2E',
        '3E',
        '6A',
        '66',
        '76',
        '6E',
        '7E',
        '40',
        '60',
        'E9',
        'E5',
        'ED',
        'FD',
        'F9',
        'E1',
        'F1',
        '38',
        'F8',
        '78',
        '85',
        '95',
        '8D',
        '9D',
        '99',
        '81',
        '91'
    ];
    if (skip.includes(reference.opc)) return;

    process.stdout.write(`${reference.opc}: ${reference.assembly} `);

    let testCount = 0;
    let errorCount = 0;

    data.forEach((test, index) => {
        if (index > 255) return;

        const comp = new Computer({ monitorWidth: 320, monitorHeight: 240, ctx: null });

        //console.log(test.name);

        comp.cpu.pc.setInt(test.initial.pc);
        comp.cpu.s.setInt(test.initial.s);
        comp.cpu.a.setInt(test.initial.a);
        comp.cpu.x.setInt(test.initial.x);
        comp.cpu.y.setInt(test.initial.y);
        comp.cpu.p.setInt(test.initial.p);

        test.initial.ram.forEach(ram => {
            comp.mem.setInt(ram[0], ram[1]);
        });

        comp.cpu.processInstruction();

        let is = 0;
        let shouldBe = 0;

        is = comp.cpu.pc.getInt();
        shouldBe = test.final.pc;
        if (is !== shouldBe) {
            //console.log(`pc mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.s.getInt();
        shouldBe = test.final.s;
        if (is !== shouldBe) {
            //console.log(`s mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.a.getInt();
        shouldBe = test.final.a;
        if (is !== shouldBe) {
            //console.log(`a mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.x.getInt();
        shouldBe = test.final.x;
        if (is !== shouldBe) {
            //console.log(`x mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.y.getInt();
        shouldBe = test.final.y;
        if (is !== shouldBe) {
            //console.log(`y mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.p.getInt();
        shouldBe = test.final.p;
        if (is !== shouldBe) {
            //console.log(`p mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        test.final.ram.forEach(ram => {
            is = comp.mem.getInt(ram[0]);
            shouldBe = ram[1];
            if (is !== shouldBe) {
                //console.log(`ram[${ram[0]}] mismatch => is: ${is})} should be: ${shouldBe}`);
                errorCount++;
            }
        });

        testCount++;
        if (testCount % 100 === 0) process.stdout.write('+');
    });

    console.log(` => error count: ${errorCount}`);
});

/* 69: ADC #$nn ++ => error count: 276
65: ADC $ll ++ => error count: 269
75: ADC $ll,X ++ => error count: 360
6D: ADC $hhll ++ => error count: 287
7D: ADC $hhll,X ++ => error count: 276

79: ADC $hhll,Y /home/y0014984/projects/65-o-fun/src/logic/Processor.ts:1841
        const result = this.a.getInt() + value.getInt() + carryBit;
                                               ^
TypeError: Cannot read properties of undefined (reading 'getInt') 

61: ADC ($ll,X) ++ => error count: 373
71: ADC ($ll),Y ++ => error count: 285
29: AND #$nn ++ => error count: 0
25: AND $ll ++ => error count: 0
35: AND $ll,X ++ => error count: 226
2D: AND $hhll ++ => error count: 0
3D: AND $hhll,X ++ => error count: 0
39: AND $hhll,Y ++ => error count: 0
21: AND ($ll,X) ++ => error count: 462
31: AND ($ll),Y ++ => error count: 458
0A: ASL ++ => error count: 0
06: ASL $ll ++ => error count: 0
16: ASL $ll,X ++ => error count: 242
0E: ASL $hhll ++ => error count: 0
1E: ASL $hhll,X ++ => error count: 0
90: BCC $hhll ++ => error count: 17
B0: BCS $hhll ++ => error count: 17
F0: BEQ $hhll ++ => error count: 15
24: BIT $ll ++ => error count: 0
2C: BIT $hhll ++ => error count: 0
30: BMI $hhll ++ => error count: 19
D0: BNE $hhll ++ => error count: 13
10: BPL $hhll ++ => error count: 19
00: BRK $hhll ++ => error count: 512
50: BVC $hhll ++ => error count: 128
70: BVS $hhll ++ => error count: 133
18: CLC ++ => error count: 0
D8: CLD ++ => error count: 0
58: CLI ++ => error count: 0
B8: CLV ++ => error count: 0
C9: CMP #$nn ++ => error count: 45
C5: CMP $ll ++ => error count: 70
D5: CMP $ll,X ++ => error count: 118
CD: CMP $hhll ++ => error count: 62
DD: CMP $hhll,X ++ => error count: 58
D9: CMP $hhll,Y ++ => error count: 76
C1: CMP ($ll,X) ++ => error count: 119
D1: CMP ($ll),Y ++ => error count: 62
E0: CPX #$nn ++ => error count: 64
E4: CPX $ll ++ => error count: 58
EC: CPX $hhll ++ => error count: 54
C0: CPY #$nn ++ => error count: 58
C4: CPY $ll ++ => error count: 70
CC: CPY $hhll ++ => error count: 65
C6: DEC $ll ++ => error count: 0
D6: DEC $ll,X ++ => error count: 197
CE: DEC $hhll ++ => error count: 0
DE: DEC $hhll,X ++ => error count: 0
CA: DEX ++ => error count: 206
88: DEY ++ => error count: 186
49: EOR #$nn ++ => error count: 0
45: EOR $ll ++ => error count: 0
55: EOR $ll,X ++ => error count: 170
4D: EOR $hhll ++ => error count: 0

5D: EOR $hhll,X +/home/y0014984/projects/65-o-fun/src/logic/Memory.ts:27
        return this.mem[index].getInt();
                               ^
TypeError: Cannot read properties of undefined (reading 'getInt')

59: EOR $hhll,Y ++ => error count: 0
41: EOR ($ll,X) ++ => error count: 202
51: EOR ($ll),Y ++ => error count: 5
E6: INC $ll ++ => error count: 0
F6: INC $ll,X ++ => error count: 191
EE: INC $hhll ++ => error count: 0

FE: INC $hhll,X +/home/y0014984/projects/65-o-fun/src/logic/Processor.ts:1880
        let value = byte.getInt();
                         ^
TypeError: Cannot read properties of undefined (reading 'getInt')

E8: INX ++ => error count: 191
C8: INY ++ => error count: 175
4C: JMP $hhll ++ => error count: 0
6C: JMP ($hhll) ++ => error count: 0
20: JSR $hhll ++ => error count: 0
A9: LDA #$nn ++ => error count: 0
A5: LDA $ll ++ => error count: 0
B5: LDA $ll,X ++ => error count: 280
AD: LDA $hhll ++ => error count: 0
BD: LDA $hhll,X ++ => error count: 0

B9: LDA $hhll,Y ++/home/y0014984/projects/65-o-fun/src/logic/Memory.ts:27
        return this.mem[index].getInt();
                               ^
TypeError: Cannot read properties of undefined (reading 'getInt')

A1: LDA ($ll,X) ++ => error count: 257
B1: LDA ($ll),Y ++ => error count: 2
A2: LDX #$nn ++ => error count: 0
A6: LDX $ll ++ => error count: 0
B6: LDX $ll,Y ++ => error count: 236
AE: LDX $hhll ++ => error count: 0

BE: LDX $hhll,Y /home/y0014984/projects/65-o-fun/src/logic/Memory.ts:27
        return this.mem[index].getInt();
                               ^
TypeError: Cannot read properties of undefined (reading 'getInt')

A0: LDY #$nn ++ => error count: 0
A4: LDY $ll ++ => error count: 0
B4: LDY $ll,X ++ => error count: 256
AC: LDY $hhll ++ => error count: 0
BC: LDY $hhll,X ++ => error count: 0
4A: LSR ++ => error count: 0
46: LSR $ll ++ => error count: 0
56: LSR $ll,X ++ => error count: 242
4E: LSR $hhll ++ => error count: 0

5E: LSR $hhll,X /home/y0014984/projects/65-o-fun/src/logic/Processor.ts:1801
        const newBitsWithCarry = ((byte.getInt() << 1) >>> 1).toString(2).slice(-9).padStart(9, '0');
                                        ^
TypeError: Cannot read properties of undefined (reading 'getInt')

EA: NOP ++ => error count: 0
09: ORA #$nn ++ => error count: 0
05: ORA $ll ++ => error count: 0
15: ORA $ll,X ++ => error count: 132
0D: ORA $hhll ++ => error count: 0
1D: ORA $hhll,X ++ => error count: 0
19: ORA $hhll,Y ++ => error count: 0
01: ORA ($ll,X) ++ => error count: 145
11: ORA ($ll),Y ++ => error count: 1
48: PHA ++ => error count: 0
08: PHP ++ => error count: 256
68: PLA ++ => error count: 0
28: PLP ++ => error count: 194
2A: ROL ++ => error count: 471
26: ROL $ll ++ => error count: 462
36: ROL $ll,X ++ => error count: 484
2E: ROL $hhll ++ => error count: 463
3E: ROL $hhll,X ++ => error count: 481
6A: ROR ++ => error count: 432
66: ROR $ll ++ => error count: 413
76: ROR $ll,X ++ => error count: 473
6E: ROR $hhll ++ => error count: 410

7E: ROR $hhll,X +/home/y0014984/projects/65-o-fun/src/logic/Processor.ts:1827
        const value = byte.getInt().toString();
                           ^
TypeError: Cannot read properties of undefined (reading 'getInt')

40: RTI ++ => error count: 256
60: RTS ++ => error count: 0
E9: SBC #$nn ++ => error count: 226
E5: SBC $ll ++ => error count: 215
ED: SBC $hhll ++ => error count: 217

FD: SBC $hhll,X /home/y0014984/projects/65-o-fun/src/logic/Processor.ts:1856
        const result = this.a.getInt() - value.getInt() - 1 + carryBit;
                                               ^
TypeError: Cannot read properties of undefined (reading 'getInt')

F9: SBC $hhll,Y ++ => error count: 212
E1: SBC ($ll,X) ++ => error count: 360
F1: SBC ($ll),Y ++ => error count: 201
38: SEC ++ => error count: 0
F8: SED ++ => error count: 0
78: SEI ++ => error count: 0
85: STA $ll ++ => error count: 0
95: STA $ll,X ++ => error count: 124
8D: STA $hhll ++ => error count: 0
9D: STA $hhll,X ++ => error count: 0

99: STA $hhll,Y +/home/y0014984/projects/65-o-fun/src/logic/Memory.ts:21
        this.mem[index].setInt(value);
                        ^
TypeError: Cannot read properties of undefined (reading 'setInt')

81: STA ($ll,X) ++ => error count: 125
91: STA ($ll),Y /home/y0014984/projects/65-o-fun/src/logic/Memory.ts:21
        this.mem[index].setInt(value);
                        ^
TypeError: Cannot read properties of undefined (reading 'setInt')

86: STX $ll ++ => error count: 0
96: STX $ll,Y ++ => error count: 116
8E: STX $hhll ++ => error count: 0
84: STY $ll ++ => error count: 0
94: STY $ll,X ++ => error count: 124
8C: STY $hhll ++ => error count: 0
AA: TAX ++ => error count: 0
A8: TAY ++ => error count: 0
BA: TSX ++ => error count: 0
8A: TXA ++ => error count: 0
9A: TXS ++ => error count: 0
98: TYA ++ => error count: 0
*/
