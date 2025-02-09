import * as fs from 'node:fs';
import { Computer } from '../src/logic/Computer.ts';

const comp = new Computer({ monitorWidth: 320, monitorHeight: 240 });

const prg = fs.readFileSync('./tests/decimalTest.prg', 'binary');

comp.cpu.pc.setInt(prg.substring(0, 1).charCodeAt(0), prg.substring(1, 2).charCodeAt(0));

for (let i = 2; i < prg.length; i++) {
    comp.mem.setInt(comp.cpu.pc.int + i - 2, prg.substring(i, i + 1).charCodeAt(0));
}

while (true) {
    comp.cpu.processInstruction();
    if (comp.cpu.ir.int[0] === 0) {
        // BRK
        console.log(comp.cpu.a.int);
        break;
    }
}
