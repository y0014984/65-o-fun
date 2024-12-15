import * as fs from 'node:fs';
import { Computer } from '../src/logic/Computer.ts';
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

    // Skip these Opcodes
    const skip = [''];
    if (skip.includes(reference.opc)) return;

    // Skip everything except these Opcodes
    const skip2 = ['71'];
    if (!skip2.includes(reference.opc)) return;

    //console.log(`${reference.opc}: ${reference.assembly} `);

    let testCount = 0;
    let errorCount = 0;
    let aErrorCount = 0;
    let overflowErrorCount = 0;
    let negativeErrorCount = 0;
    let carryErrorCount = 0;
    let zeroErrorCount = 0;

    const timeStart = Date.now();

    data.every((test, index) => {
        const comp = new Computer({ monitorWidth: 320, monitorHeight: 240 });

        console.log(test.name);

        comp.cpu.pc.setInt(test.initial.pc & 0x00ff, (test.initial.pc & 0xff00) >> 8);
        comp.cpu.s.setInt(test.initial.s);
        comp.cpu.a.setInt(test.initial.a);
        comp.cpu.x.setInt(test.initial.x);
        comp.cpu.y.setInt(test.initial.y);
        comp.cpu.p.setInt(test.initial.p);

        if (comp.cpu.p.getDecimalFlag()) process.stdout.write(' D ');

        test.initial.ram.forEach(ram => {
            comp.mem.setInt(ram[0], ram[1]);
        });

        comp.cpu.processInstruction();

        let is = 0;
        let shouldBe = 0;

        is = comp.cpu.pc.int;
        shouldBe = test.final.pc;
        if (is !== shouldBe) {
            console.log(`PC mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.s.int;
        shouldBe = test.final.s;
        if (is !== shouldBe) {
            console.log(`S mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.a.int;
        shouldBe = test.final.a;
        if (is !== shouldBe) {
            console.log(`A mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
            aErrorCount++;
        }

        is = comp.cpu.x.int;
        shouldBe = test.final.x;
        if (is !== shouldBe) {
            console.log(`X mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.y.int;
        shouldBe = test.final.y;
        if (is !== shouldBe) {
            console.log(`Y mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.p.int;
        shouldBe = test.final.p;
        if (is !== shouldBe) {
            console.log(`P mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;

            const overflowIs = (is & 0b01000000) === 0b01000000;
            const overflowShouldBe = (shouldBe & 0b01000000) === 0b01000000;
            if (overflowIs !== overflowShouldBe) overflowErrorCount++;

            const negativeIs = (is & 0b10000000) === 0b10000000;
            const negativeShouldBe = (shouldBe & 0b10000000) === 0b10000000;
            if (negativeIs !== negativeShouldBe) negativeErrorCount++;

            const carryIs = (is & 0b00000001) === 0b00000001;
            const carryShouldBe = (shouldBe & 0b00000001) === 0b00000001;
            if (carryIs !== carryShouldBe) carryErrorCount++;

            const zeroIs = (is & 0b00000010) === 0b00000010;
            const zeroShouldBe = (shouldBe & 0b00000010) === 0b00000010;
            if (zeroIs !== zeroShouldBe) zeroErrorCount++;
        }

        test.final.ram.forEach(ram => {
            is = comp.mem.int[ram[0]];
            shouldBe = ram[1];
            if (is !== shouldBe) {
                console.log(`ram[${ram[0]}] mismatch => is: ${is})} should be: ${shouldBe}`);
                errorCount++;
            }
        });

        testCount++;
        if (testCount % 250 === 0) process.stdout.write('+');

        //return errorCount > 0 ? false : true;
        //return aErrorCount > 0 ? false : true;
        //return negativeErrorCount > 0 ? false : true;
        return true;
    });

    const timeEnd = Date.now();

    const duration = (timeEnd - timeStart) / testCount;

    console.log(`${reference.opc}: ${reference.assembly} => tests: ${testCount} errors: ${errorCount} duration: ${duration}`);

    console.log(`start: ${timeStart} end: ${timeEnd} difference: ${timeEnd - timeStart}`);
    console.log(`A errors: ${aErrorCount}`);
    console.log(`overflow errors: ${overflowErrorCount}`);
    console.log(`negative errors: ${negativeErrorCount}`);
    console.log(`carry errors: ${carryErrorCount}`);
    console.log(`zero errors: ${zeroErrorCount}`);
});

// *1 Word address overrun
// *2 Wrong Opcode
// *3 Byte address overrun
// *4 Missing Reference
// *5 Zeropage address overrun
// *6 2nd Zeropage address overrun
// *7 RTI break and interrupt flag
// *8 ROR bug
// *9 ROL bug
// *A PLP bug
// *B PHP bug
// *C INC/DEC p bits bug
// *D Bug with addressXY and addByteToWord
// *E Compare Bug
// *F BRK bug
// *X addToWord bug
// *Y ADC bug
// *Z SBC bug

/* 

69: ADC #$nn ++ => error count: 0 / 10000 *Y
65: ADC $ll ++ => error count: 0 / 10000 *Y
75: ADC $ll,X ++ => error count: 0 / 10000 *3Y
6D: ADC $hhll ++ => error count: 0 / 10000 *Y
7D: ADC $hhll,X ++ => error count: 0 / 10000 *1Y
79: ADC $hhll,Y ++ => error count: 0 / 10000 *1Y
61: ADC ($ll,X) ++ => error count: 0 / 10000 *5Y
71: ADC ($ll),Y ++ => error count: 1 / 10000 *16Y  ################# 1 zero error

29: AND #$nn ++ => error count: 0
25: AND $ll ++ => error count: 0
35: AND $ll,X ++ => error count: 0 / 10000 *3
2D: AND $hhll ++ => error count: 0
3D: AND $hhll,X ++ => error count: 0 / 10000 *1
39: AND $hhll,Y ++ => error count: 0 / 10000 *1
21: AND ($ll,X) ++ => error count: 0 / 10000 *125
31: AND ($ll),Y ++ => error count: 0 / 10000 *126

0A: ASL ++ => error count: 0 / 10000
06: ASL $ll ++ => error count: 0 / 10000
16: ASL $ll,X ++ => error count: 0 / 10000 *3
0E: ASL $hhll ++ => error count: 0 / 10000
1E: ASL $hhll,X ++ => error count: 0 / 10000 *1D

90: BCC $hhll ++ => error count: 0 / 10000 *X

B0: BCS $hhll ++ => error count: 0 / 10000 *X

F0: BEQ $hhll ++ => error count: 0 / 10000 *X

24: BIT $ll ++ => error count: 0
2C: BIT $hhll ++ => error count: 0

30: BMI $hhll ++ => error count: 0 / 10000 *X

D0: BNE $hhll ++ => error count: 0 / 10000 *X

10: BPL $hhll ++ => error count: 0 / 10000 *X

00: BRK $hhll ++ => error count: 0 / 10000 *F

50: BVC $hhll ++ => error count: 0 / 10000 *X

70: BVS $hhll ++ => error count: 0 / 10000 *X

18: CLC ++ => error count: 0

D8: CLD ++ => error count: 0

58: CLI ++ => error count: 0

B8: CLV ++ => error count: 0

C9: CMP #$nn ++ => error count: 0 / 10000 *E
C5: CMP $ll ++ => error count: 0 / 10000 *E
D5: CMP $ll,X ++ => error count: 0 / 10000 *3E
CD: CMP $hhll ++ => error count: 0 / 10000 *E
DD: CMP $hhll,X ++ => error count: 0 / 10000 *1E
D9: CMP $hhll,Y ++ => error count: 0 / 10000 *1E
C1: CMP ($ll,X) ++ => error count: 0 / 10000 *5E
D1: CMP ($ll),Y ++ => error count: 0 / 10000 *16E

E0: CPX #$nn ++ => error count: 0 / 10000 *E
E4: CPX $ll ++ => error count: 0 / 10000 *E
EC: CPX $hhll ++ => error count: 0 / 10000 *E

C0: CPY #$nn ++ => error count: 0 / 10000 *E
C4: CPY $ll ++ => error count: 0 / 10000 *E
CC: CPY $hhll ++ => error count: 0 / 10000 *E

C6: DEC $ll ++ => error count: 0
D6: DEC $ll,X ++ => error count: 0 / 10000 *3
CE: DEC $hhll ++ => error count: 0
DE: DEC $hhll,X ++ => error count: 0 / 10000 *1

CA: DEX ++ => error count: 0 / 10000 *C

88: DEY ++ => error count: 0 / 10000 *C

49: EOR #$nn ++ => error count: 0
45: EOR $ll ++ => error count: 0
55: EOR $ll,X ++ => error count: 0 / 10000 *1
4D: EOR $hhll ++ => error count: 0
5D: EOR $hhll,X ++ => error count 0 / 10000 *1
59: EOR $hhll,Y ++ => error count: 0 / 10000 *1
41: EOR ($ll,X) ++ => error count: 0 / 10000 *5
51: EOR ($ll),Y ++ => error count: 0 / 10000 *16

E6: INC $ll ++ => error count: 0
F6: INC $ll,X ++ => error count: 0 / 10000 *3
EE: INC $hhll ++ => error count: 0
FE: INC $hhll,X ++ => error count: 0 / 10000 *1

E8: INX ++ => error count: 0 / 10000 *C

C8: INY ++ => error count: 0 / 10000 *C

4C: JMP $hhll ++ => error count: 0
6C: JMP ($hhll) ++ => error count: 0

20: JSR $hhll ++ => error count: 0

A9: LDA #$nn ++ => error count: 0
A5: LDA $ll ++ => error count: 0
B5: LDA $ll,X ++ => error count: 0 / 10000 *3
AD: LDA $hhll ++ => error count: 0
BD: LDA $hhll,X ++ => error count: 0 / 10000 *1
B9: LDA $hhll,Y ++ => error count: 0 / 10000 *1
A1: LDA ($ll,X) ++ => error count: 0 / 10000 *5
B1: LDA ($ll),Y ++ => error count: 0 / 10000 *1

A2: LDX #$nn ++ => error count: 0
A6: LDX $ll ++ => error count: 0
B6: LDX $ll,Y ++ => error count: 0 / 10000 *3
AE: LDX $hhll ++ => error count: 0
BE: LDX $hhll,Y ++ => error count: 0 / 10000 *1

A0: LDY #$nn ++ => error count: 0
A4: LDY $ll ++ => error count: 0
B4: LDY $ll,X ++ => error count: 0 / 10000 *3
AC: LDY $hhll ++ => error count: 0
BC: LDY $hhll,X ++ => error count: 0 / 10000 *1

4A: LSR ++ => error count: 0
46: LSR $ll ++ => error count: 0
56: LSR $ll,X ++ => error count: 0 / 10000 *3
4E: LSR $hhll ++ => error count: 0
5E: LSR $hhll,X ++ => error count: 0 / 10000 *1D

EA: NOP ++ => error count: 0

09: ORA #$nn ++ => error count: 0
05: ORA $ll ++ => error count: 0
15: ORA $ll,X ++ => error count: 0 / 10000 *3
0D: ORA $hhll ++ => error count: 0
1D: ORA $hhll,X ++ => error count: 0 / 10000 *1
19: ORA $hhll,Y ++ => error count: 0 / 10000 *1
01: ORA ($ll,X) ++ => error count: 0 / 10000 *5
11: ORA ($ll),Y ++ => error count: 0 / 10000 *16

48: PHA ++ => error count: 0

08: PHP ++ => error count: 0 / 10000 *B

68: PLA ++ => error count: 0

28: PLP ++ => error count: 0 / 10000 *A

2A: ROL ++ => error count: 0 / 10000 *9
26: ROL $ll ++ => error count: 0 / 10000 *9
36: ROL $ll,X ++ => error count: 0 / 10000 *39
2E: ROL $hhll ++ => error count: 0 / 10000 *9
3E: ROL $hhll,X ++ => error count: 0 / 10000 *19

6A: ROR ++ => error count: 0 / 10000 *8
66: ROR $ll ++ => error count: 0 / 10000 *8
76: ROR $ll,X ++ => error count: 0 / 10000 *38
6E: ROR $hhll ++ => error count: 0 / 10000 *8
7E: ROR $hhll,X ++ => error count: 0 / 10000 *18

40: RTI ++ => error count: 0 / 10000 *7

60: RTS ++ => error count: 0

E9: SBC #$nn ++ => error count: 0 / 10000 *Z
E5: SBC $ll ++ => error count: 1 / 10000 *Z ############################## 1 zero error
F5: SBC $ll,X ++ => error count: 0 / 10000 *34Z
ED: SBC $hhll ++ => error count: 0 / 10000 *Z
FD: SBC $hhll,X ++ => error count: 0 / 10000 *1Z
F9: SBC $hhll,Y ++ => error count: 0 / 10000 *1Z
E1: SBC ($ll,X) ++ => error count: 0 / 10000 *5Z
F1: SBC ($ll),Y ++ => error count: 0 / 10000 *Z

38: SEC ++ => error count: 0

F8: SED ++ => error count: 0

78: SEI ++ => error count: 0

85: STA $ll ++ => error count: 0
95: STA $ll,X ++ => error count: 0 / 10000 *3
8D: STA $hhll ++ => error count: 0
9D: STA $hhll,X ++ => error count: 0 / 10000 *1
99: STA $hhll,Y ++ => error count: 0 / 10000 *1
81: STA ($ll,X) ++ => error count: 0 / 10000 *5
91: STA ($ll),Y ++ => error count: 0 / 10000 *16

86: STX $ll ++ => error count: 0
96: STX $ll,Y ++ => error count: 0 / 10000 *3
8E: STX $hhll ++ => error count: 0

84: STY $ll ++ => error count: 0
94: STY $ll,X ++ => error count: 0 / 10000 *3
8C: STY $hhll ++ => error count: 0

AA: TAX ++ => error count: 0

A8: TAY ++ => error count: 0

BA: TSX ++ => error count: 0

8A: TXA ++ => error count: 0

9A: TXS ++ => error count: 0

98: TYA ++ => error count: 0 / 10000

// ---------------------------------------------------------------

69: ADC #$nn => tests: 10000 errors: 0 duration: 0.6171 (with overhead)
65: ADC $ll => tests: 10000 errors: 0 duration: 0.7273 (with overhead)
75: ADC $ll,X => tests: 10000 errors: 0 duration: 0.574 (with overhead)
6D: ADC $hhll => tests: 10000 errors: 0 duration: 0.5776 (with overhead)
7D: ADC $hhll,X => tests: 10000 errors: 0 duration: 0.6168 (with overhead)
79: ADC $hhll,Y => tests: 10000 errors: 0 duration: 0.6399 (with overhead)
61: ADC ($ll,X) => tests: 10000 errors: 0 duration: 0.7259 (with overhead)
71: ADC ($ll),Y => tests: 10000 errors: 1 duration: 0.8075 (with overhead) ### 1 error | 71 c5 90 | P mismatch => is: 97 should be: 99
29: AND #$nn => tests: 10000 errors: 0 duration: 0.5879 (with overhead)
25: AND $ll => tests: 10000 errors: 0 duration: 0.5702 (with overhead)
35: AND $ll,X => tests: 10000 errors: 0 duration: 0.6249 (with overhead)
2D: AND $hhll => tests: 10000 errors: 0 duration: 0.6399 (with overhead)
3D: AND $hhll,X => tests: 10000 errors: 0 duration: 0.6259 (with overhead)
39: AND $hhll,Y => tests: 10000 errors: 0 duration: 0.7043 (with overhead)
21: AND ($ll,X) => tests: 10000 errors: 0 duration: 0.5702 (with overhead)
31: AND ($ll),Y => tests: 10000 errors: 0 duration: 0.6263 (with overhead)
0A: ASL => tests: 10000 errors: 0 duration: 0.6343 (with overhead)
06: ASL $ll => tests: 10000 errors: 0 duration: 0.6506 (with overhead)
16: ASL $ll,X => tests: 10000 errors: 0 duration: 0.747 (with overhead)
0E: ASL $hhll => tests: 10000 errors: 0 duration: 0.5863 (with overhead)
1E: ASL $hhll,X => tests: 10000 errors: 0 duration: 0.6289 (with overhead)
90: BCC $hhll => tests: 10000 errors: 0 duration: 0.5781 (with overhead)
B0: BCS $hhll => tests: 10000 errors: 0 duration: 0.5972 (with overhead)
F0: BEQ $hhll => tests: 10000 errors: 0 duration: 0.5877 (with overhead)
24: BIT $ll => tests: 10000 errors: 0 duration: 0.6405 (with overhead)
2C: BIT $hhll => tests: 10000 errors: 0 duration: 0.6404 (with overhead)
30: BMI $hhll => tests: 10000 errors: 0 duration: 0.5839 (with overhead)
D0: BNE $hhll => tests: 10000 errors: 0 duration: 0.5978 (with overhead)
10: BPL $hhll => tests: 10000 errors: 0 duration: 0.5903 (with overhead)
00: BRK $hhll => tests: 10000 errors: 0 duration: 0.5922 (with overhead)
50: BVC $hhll => tests: 10000 errors: 0 duration: 0.5934 (with overhead)
70: BVS $hhll => tests: 10000 errors: 0 duration: 0.6078 (with overhead)
18: CLC => tests: 10000 errors: 0 duration: 0.5888 (with overhead)
D8: CLD => tests: 10000 errors: 0 duration: 0.6096 (with overhead)
58: CLI => tests: 10000 errors: 0 duration: 0.6172 (with overhead)
B8: CLV => tests: 10000 errors: 0 duration: 0.6439 (with overhead)
C9: CMP #$nn => tests: 10000 errors: 0 duration: 0.7283 (with overhead)
C5: CMP $ll => tests: 10000 errors: 0 duration: 0.5795 (with overhead)
D5: CMP $ll,X => tests: 10000 errors: 0 duration: 0.5769 (with overhead)
CD: CMP $hhll => tests: 10000 errors: 0 duration: 0.6214 (with overhead)
DD: CMP $hhll,X => tests: 10000 errors: 0 duration: 0.6514 (with overhead)
D9: CMP $hhll,Y => tests: 10000 errors: 0 duration: 0.6429 (with overhead)
C1: CMP ($ll,X) => tests: 10000 errors: 0 duration: 0.6795 (with overhead)
D1: CMP ($ll),Y => tests: 10000 errors: 0 duration: 0.5665 (with overhead)
E0: CPX #$nn => tests: 10000 errors: 0 duration: 0.6262 (with overhead)
E4: CPX $ll => tests: 10000 errors: 0 duration: 0.6423 (with overhead)
EC: CPX $hhll => tests: 10000 errors: 0 duration: 0.6368 (with overhead)
C0: CPY #$nn => tests: 10000 errors: 0 duration: 0.7073 (with overhead)
C4: CPY $ll => tests: 10000 errors: 0 duration: 0.5692 (with overhead)
CC: CPY $hhll => tests: 10000 errors: 0 duration: 0.6209 (with overhead)
C6: DEC $ll => tests: 10000 errors: 0 duration: 0.637 (with overhead)
D6: DEC $ll,X => tests: 10000 errors: 0 duration: 0.6351 (with overhead)
CE: DEC $hhll => tests: 10000 errors: 0 duration: 0.7216 (with overhead)
DE: DEC $hhll,X => tests: 10000 errors: 0 duration: 0.5681 (with overhead)
CA: DEX => tests: 10000 errors: 0 duration: 0.609 (with overhead)
88: DEY => tests: 10000 errors: 0 duration: 0.6198 (with overhead)
49: EOR #$nn => tests: 10000 errors: 0 duration: 0.6313 (with overhead)
45: EOR $ll => tests: 10000 errors: 0 duration: 0.7351 (with overhead)
55: EOR $ll,X => tests: 10000 errors: 0 duration: 0.5748 (with overhead)
4D: EOR $hhll => tests: 10000 errors: 0 duration: 0.6096 (with overhead)
5D: EOR $hhll,X => tests: 10000 errors: 0 duration: 0.6194 (with overhead)
59: EOR $hhll,Y => tests: 10000 errors: 0 duration: 0.6357 (with overhead)
41: EOR ($ll,X) => tests: 10000 errors: 0 duration: 0.7356 (with overhead)
51: EOR ($ll),Y => tests: 10000 errors: 0 duration: 0.5845 (with overhead)
E6: INC $ll => tests: 10000 errors: 0 duration: 0.5831 (with overhead)
F6: INC $ll,X => tests: 10000 errors: 0 duration: 0.6192 (with overhead)
EE: INC $hhll => tests: 10000 errors: 0 duration: 0.6449 (with overhead)
FE: INC $hhll,X => tests: 10000 errors: 0 duration: 0.637 (with overhead)
E8: INX => tests: 10000 errors: 0 duration: 0.6924 (with overhead)
C8: INY => tests: 10000 errors: 0 duration: 0.5641 (with overhead)
4C: JMP $hhll => tests: 10000 errors: 0 duration: 0.6192 (with overhead)
6C: JMP ($hhll) => tests: 10000 errors: 0 duration: 0.6995 (with overhead)
20: JSR $hhll => tests: 10000 errors: 1 duration: 0.6813 (with overhead) ### 1 error | 20 55 13 | PC mismatch => is: 4949 should be: 341
A9: LDA #$nn => tests: 10000 errors: 0 duration: 0.6571 (with overhead)
A5: LDA $ll => tests: 10000 errors: 0 duration: 0.7631 (with overhead)
B5: LDA $ll,X => tests: 10000 errors: 0 duration: 0.6238 (with overhead)
AD: LDA $hhll => tests: 10000 errors: 0 duration: 0.6136 (with overhead)
BD: LDA $hhll,X => tests: 10000 errors: 0 duration: 0.619 (with overhead)
B9: LDA $hhll,Y => tests: 10000 errors: 0 duration: 0.636 (with overhead)
A1: LDA ($ll,X) => tests: 10000 errors: 0 duration: 0.7354 (with overhead)
B1: LDA ($ll),Y => tests: 10000 errors: 0 duration: 0.5909 (with overhead)
A2: LDX #$nn => tests: 10000 errors: 0 duration: 0.5803 (with overhead)
A6: LDX $ll => tests: 10000 errors: 0 duration: 0.6176 (with overhead)
B6: LDX $ll,Y => tests: 10000 errors: 0 duration: 0.649 (with overhead)
AE: LDX $hhll => tests: 10000 errors: 0 duration: 0.6424 (with overhead)
BE: LDX $hhll,Y => tests: 10000 errors: 0 duration: 0.6854 (with overhead)
A0: LDY #$nn => tests: 10000 errors: 0 duration: 0.5638 (with overhead)
A4: LDY $ll => tests: 10000 errors: 0 duration: 0.6264 (with overhead)
B4: LDY $ll,X => tests: 10000 errors: 0 duration: 0.6462 (with overhead)
AC: LDY $hhll => tests: 10000 errors: 0 duration: 0.6358 (with overhead)
BC: LDY $hhll,X => tests: 10000 errors: 0 duration: 0.7069 (with overhead)
4A: LSR => tests: 10000 errors: 0 duration: 0.5699 (with overhead)
46: LSR $ll => tests: 10000 errors: 0 duration: 0.6178 (with overhead)
56: LSR $ll,X => tests: 10000 errors: 0 duration: 0.6392 (with overhead)
4E: LSR $hhll => tests: 10000 errors: 0 duration: 0.6342 (with overhead)
5E: LSR $hhll,X => tests: 10000 errors: 0 duration: 0.7239 (with overhead)
EA: NOP => tests: 10000 errors: 0 duration: 0.5682 (with overhead)
09: ORA #$nn => tests: 10000 errors: 0 duration: 0.6083 (with overhead)
05: ORA $ll => tests: 10000 errors: 0 duration: 0.6243 (with overhead)
15: ORA $ll,X => tests: 10000 errors: 0 duration: 0.6343 (with overhead)
0D: ORA $hhll => tests: 10000 errors: 0 duration: 0.73 (with overhead)
1D: ORA $hhll,X => tests: 10000 errors: 0 duration: 0.6221 (with overhead)
19: ORA $hhll,Y => tests: 10000 errors: 0 duration: 0.6572 (with overhead)
01: ORA ($ll,X) => tests: 10000 errors: 0 duration: 0.6571 (with overhead)
11: ORA ($ll),Y => tests: 10000 errors: 0 duration: 0.6321 (with overhead)
48: PHA => tests: 10000 errors: 0 duration: 0.6265 (with overhead)
08: PHP => tests: 10000 errors: 0 duration: 0.575 (with overhead)
68: PLA => tests: 10000 errors: 0 duration: 0.5763 (with overhead)
28: PLP => tests: 10000 errors: 0 duration: 0.6083 (with overhead)
2A: ROL => tests: 10000 errors: 0 duration: 0.6361 (with overhead)
26: ROL $ll => tests: 10000 errors: 0 duration: 0.6757 (with overhead)
36: ROL $ll,X => tests: 10000 errors: 0 duration: 0.7095 (with overhead)
2E: ROL $hhll => tests: 10000 errors: 0 duration: 0.6085 (with overhead)
3E: ROL $hhll,X => tests: 10000 errors: 0 duration: 0.6046 (with overhead)
6A: ROR => tests: 10000 errors: 0 duration: 0.632 (with overhead)
66: ROR $ll => tests: 10000 errors: 0 duration: 0.623 (with overhead)
76: ROR $ll,X => tests: 10000 errors: 0 duration: 0.6973 (with overhead)
6E: ROR $hhll => tests: 10000 errors: 0 duration: 0.6154 (with overhead)
7E: ROR $hhll,X => tests: 10000 errors: 0 duration: 0.6232 (with overhead)
40: RTI => tests: 10000 errors: 0 duration: 0.6138 (with overhead)
60: RTS => tests: 10000 errors: 0 duration: 0.6355 (with overhead)
E9: SBC #$nn => tests: 10000 errors: 0 duration: 0.7132 (with overhead)
E5: SBC $ll => tests: 10000 errors: 1 duration: 0.6559 (with overhead) ### 1 error | e5 70 ca | P mismatch => is: 97 should be: 99
F5: SBC $ll,X => tests: 10000 errors: 0 duration: 0.6236 (with overhead)
ED: SBC $hhll => tests: 10000 errors: 0 duration: 0.7125 (with overhead)
FD: SBC $hhll,X => tests: 10000 errors: 0 duration: 0.7198 (with overhead)
F9: SBC $hhll,Y => tests: 10000 errors: 0 duration: 0.6901 (with overhead)
E1: SBC ($ll,X) => tests: 10000 errors: 0 duration: 0.6946 (with overhead)
F1: SBC ($ll),Y => tests: 10000 errors: 0 duration: 0.6225 (with overhead)
38: SEC => tests: 10000 errors: 0 duration: 0.6197 (with overhead)
F8: SED => tests: 10000 errors: 0 duration: 0.623 (with overhead)
78: SEI => tests: 10000 errors: 0 duration: 0.6238 (with overhead)
85: STA $ll => tests: 10000 errors: 0 duration: 0.7012 (with overhead)
95: STA $ll,X => tests: 10000 errors: 0 duration: 0.619 (with overhead)
8D: STA $hhll => tests: 10000 errors: 0 duration: 0.6148 (with overhead)
9D: STA $hhll,X => tests: 10000 errors: 0 duration: 0.6206 (with overhead)
99: STA $hhll,Y => tests: 10000 errors: 0 duration: 0.6215 (with overhead)
81: STA ($ll,X) => tests: 10000 errors: 0 duration: 0.7066 (with overhead)
91: STA ($ll),Y => tests: 10000 errors: 0 duration: 0.6181 (with overhead)
86: STX $ll => tests: 10000 errors: 0 duration: 0.6073 (with overhead)
96: STX $ll,Y => tests: 10000 errors: 0 duration: 0.6224 (with overhead)
8E: STX $hhll => tests: 10000 errors: 0 duration: 0.6259 (with overhead)
84: STY $ll => tests: 10000 errors: 0 duration: 0.7037 (with overhead)
94: STY $ll,X => tests: 10000 errors: 0 duration: 0.6177 (with overhead)
8C: STY $hhll => tests: 10000 errors: 0 duration: 0.6022 (with overhead)
AA: TAX => tests: 10000 errors: 0 duration: 0.624 (with overhead)
A8: TAY => tests: 10000 errors: 0 duration: 0.6256 (with overhead)
BA: TSX => tests: 10000 errors: 0 duration: 0.7162 (with overhead)
8A: TXA => tests: 10000 errors: 0 duration: 0.6209 (with overhead)
9A: TXS => tests: 10000 errors: 0 duration: 0.6153 (with overhead)
98: TYA => tests: 10000 errors: 0 duration: 0.6253 (with overhead)

*/
