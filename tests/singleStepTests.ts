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
        const comp = new Computer({ monitorWidth: 320, monitorHeight: 240, ctx: null });

        console.log(test.name);

        comp.cpu.pc.setInt(test.initial.pc);
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

        is = comp.cpu.pc.getInt();
        shouldBe = test.final.pc;
        if (is !== shouldBe) {
            console.log(`PC mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.s.getInt();
        shouldBe = test.final.s;
        if (is !== shouldBe) {
            console.log(`S mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.a.getInt();
        shouldBe = test.final.a;
        if (is !== shouldBe) {
            console.log(`A mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
            aErrorCount++;
        }

        is = comp.cpu.x.getInt();
        shouldBe = test.final.x;
        if (is !== shouldBe) {
            console.log(`X mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.y.getInt();
        shouldBe = test.final.y;
        if (is !== shouldBe) {
            console.log(`Y mismatch => is: ${is} should be: ${shouldBe}`);
            errorCount++;
        }

        is = comp.cpu.p.getInt();
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
            is = comp.mem.getInt(ram[0]);
            shouldBe = ram[1];
            if (is !== shouldBe) {
                console.log(`ram[${ram[0]}] mismatch => is: ${is})} should be: ${shouldBe}`);
                errorCount++;
            }
        });

        testCount++;
        if (testCount % 250 === 0) process.stdout.write('+');

        return errorCount > 0 ? false : true;
        //return aErrorCount > 0 ? false : true;
        //return negativeErrorCount > 0 ? false : true;
        //return true;
    });

    const timeEnd = Date.now();

    const duration = (timeEnd - timeStart) / testCount;

    console.log(
        `\n ${reference.opc}: ${reference.assembly} => tests: ${testCount} errors: ${errorCount} duration: ${duration} (with overhead)`
    );
    /*     console.log(`start: ${timeStart} end: ${timeEnd} difference: ${timeEnd - timeStart}`);
    console.log(`A errors: ${aErrorCount}`);
    console.log(`overflow errors: ${overflowErrorCount}`);
    console.log(`negative errors: ${negativeErrorCount}`);
    console.log(`carry errors: ${carryErrorCount}`);
    console.log(`zero errors: ${zeroErrorCount}`); */
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

*/
