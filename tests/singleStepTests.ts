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

    const skip = [''];
    if (skip.includes(reference.opc)) return;

    const skip2 = ['3D'];
    if (!skip2.includes(reference.opc)) return;

    console.log(`${reference.opc}: ${reference.assembly} `);

    let testCount = 0;
    let errorCount = 0;

    data.every((test, index) => {
        //if (index > 255) return;

        const comp = new Computer({ monitorWidth: 320, monitorHeight: 240, ctx: null });

        //console.log(test.name);

        comp.cpu.pc.setInt(test.initial.pc);
        comp.cpu.s.setInt(test.initial.s);
        comp.cpu.a.setInt(test.initial.a);
        comp.cpu.x.setInt(test.initial.x);
        comp.cpu.y.setInt(test.initial.y);
        comp.cpu.p.setInt(test.initial.p);

        //if (comp.cpu.p.getDecimalFlag()) process.stdout.write(' D ');

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
            //console.log(`overflow is: ${is.toString(2)[1]} overflow should be: ${shouldBe.toString(2)[1]}`);
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

        //return errorCount > 10 ? false : true;
        return true;
    });

    console.log(` => test count: ${testCount} error count: ${errorCount}`);
});

// *1 Word address overrun
// *2 Wrong Opcode

/* 69: ADC #$nn ++ => error count: 1489 / 10000
65: ADC $ll ++ => error count: 269
75: ADC $ll,X ++ => error count: 360
6D: ADC $hhll ++ => error count: 287
7D: ADC $hhll,X ++ => error count: 1527 / 10000 *1
79: ADC $hhll,Y ++ => error count: 1578 / 10000 *1
61: ADC ($ll,X) ++ => error count: 373
71: ADC ($ll),Y ++ => error count: 1624 / 10000 *1

29: AND #$nn ++ => error count: 0
25: AND $ll ++ => error count: 0
35: AND $ll,X ++ => error count: 226
2D: AND $hhll ++ => error count: 0
3D: AND $hhll,X ++ => error count: 0 / 10000 *1
39: AND $hhll,Y ++ => error count: 0 / 10000 *1
21: AND ($ll,X) ++ => error count: 9037 / 10000 *12
31: AND ($ll),Y ++ => error count: 66 / 10000 *12

0A: ASL ++ => error count: 0
06: ASL $ll ++ => error count: 0
16: ASL $ll,X ++ => error count: 242
0E: ASL $hhll ++ => error count: 0
1E: ASL $hhll,X ++ => error count: 1 / 10000 *1

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
DD: CMP $hhll,X ++ => error count: 2459 / 10000 *1
D9: CMP $hhll,Y ++ => error count: 2498 / 10000 *1
C1: CMP ($ll,X) ++ => error count: 119
D1: CMP ($ll),Y ++ => error count: 2473 / 10000 *1

E0: CPX #$nn ++ => error count: 64
E4: CPX $ll ++ => error count: 58
EC: CPX $hhll ++ => error count: 54

C0: CPY #$nn ++ => error count: 58
C4: CPY $ll ++ => error count: 70
CC: CPY $hhll ++ => error count: 65

C6: DEC $ll ++ => error count: 0
D6: DEC $ll,X ++ => error count: 197
CE: DEC $hhll ++ => error count: 0
DE: DEC $hhll,X ++ => error count: 0 / 10000 *1

CA: DEX ++ => error count: 206

88: DEY ++ => error count: 186

49: EOR #$nn ++ => error count: 0
45: EOR $ll ++ => error count: 0
55: EOR $ll,X ++ => error count: 170
4D: EOR $hhll ++ => error count: 0
5D: EOR $hhll,X ++ => error count 0 / 10000 *1
59: EOR $hhll,Y ++ => error count: 0 / 10000 *1
41: EOR ($ll,X) ++ => error count: 202
51: EOR ($ll),Y ++ => error count: 45 / 10000 *1

E6: INC $ll ++ => error count: 0
F6: INC $ll,X ++ => error count: 191
EE: INC $hhll ++ => error count: 0
FE: INC $hhll,X ++ => error count: 0 / 10000 *1

E8: INX ++ => error count: 191

C8: INY ++ => error count: 175

4C: JMP $hhll ++ => error count: 0
6C: JMP ($hhll) ++ => error count: 0

20: JSR $hhll ++ => error count: 0

A9: LDA #$nn ++ => error count: 0
A5: LDA $ll ++ => error count: 0
B5: LDA $ll,X ++ => error count: 280
AD: LDA $hhll ++ => error count: 0
BD: LDA $hhll,X ++ => error count: 0 / 10000 *1
B9: LDA $hhll,Y ++ => error count: 0 / 10000 *1
A1: LDA ($ll,X) ++ => error count: 257
B1: LDA ($ll),Y ++ => error count: 64 / 10000 *1

A2: LDX #$nn ++ => error count: 0
A6: LDX $ll ++ => error count: 0
B6: LDX $ll,Y ++ => error count: 236
AE: LDX $hhll ++ => error count: 0
BE: LDX $hhll,Y ++ => error count: 0 / 10000 *1

A0: LDY #$nn ++ => error count: 0
A4: LDY $ll ++ => error count: 0
B4: LDY $ll,X ++ => error count: 256
AC: LDY $hhll ++ => error count: 0
BC: LDY $hhll,X ++ => error count: 0 / 10000 *1

4A: LSR ++ => error count: 0
46: LSR $ll ++ => error count: 0
56: LSR $ll,X ++ => error count: 242
4E: LSR $hhll ++ => error count: 0
5E: LSR $hhll,X ++ => error count: 0 / 10000 *1

EA: NOP ++ => error count: 0

09: ORA #$nn ++ => error count: 0
05: ORA $ll ++ => error count: 0
15: ORA $ll,X ++ => error count: 132
0D: ORA $hhll ++ => error count: 0
1D: ORA $hhll,X ++ => error count: 0 / 10000 *1
19: ORA $hhll,Y ++ => error count: 0 / 10000 *1
01: ORA ($ll,X) ++ => error count: 145
11: ORA ($ll),Y ++ => error count: 42 / 10000 *1

48: PHA ++ => error count: 0

08: PHP ++ => error count: 256

68: PLA ++ => error count: 0

28: PLP ++ => error count: 194

2A: ROL ++ => error count: 471
26: ROL $ll ++ => error count: 462
36: ROL $ll,X ++ => error count: 484
2E: ROL $hhll ++ => error count: 463
3E: ROL $hhll,X ++ => error count: 18415 / 10000 *1

6A: ROR ++ => error count: 432
66: ROR $ll ++ => error count: 413
76: ROR $ll,X ++ => error count: 473
6E: ROR $hhll ++ => error count: 410
7E: ROR $hhll,X ++ => error count: 16465 / 10000 *1

40: RTI ++ => error count: 256

60: RTS ++ => error count: 0

E9: SBC #$nn ++ => error count: 226
E5: SBC $ll ++ => error count: 215
ED: SBC $hhll ++ => error count: 217
FD: SBC $hhll,X ++ => error count: 7359 / 10000 *1
F9: SBC $hhll,Y ++ => error count: 7504 / 10000 *1
E1: SBC ($ll,X) ++ => error count: 360
F1: SBC ($ll),Y ++ => error count: 7515 / 10000 *1

38: SEC ++ => error count: 0

F8: SED ++ => error count: 0

78: SEI ++ => error count: 0

85: STA $ll ++ => error count: 0
95: STA $ll,X ++ => error count: 124
8D: STA $hhll ++ => error count: 0
9D: STA $hhll,X ++ => error count: 0 / 10000 *1
99: STA $hhll,Y ++ => error count: 0 / 10000 *1
81: STA ($ll,X) ++ => error count: 125
91: STA ($ll),Y ++ => error count: 52 / 10000 *1

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
