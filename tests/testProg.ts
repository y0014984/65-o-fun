import * as fs from 'node:fs';
import Computer from '../src/logic/Computer.ts';

const comp = new Computer({ monitorWidth: 320, monitorHeight: 240, ctx: null });

const prg = fs.readFileSync('./tests/decimalTest.prg', 'binary');

comp.cpu.pc.setInt(prg.substring(0, 1).charCodeAt(0), prg.substring(1, 2).charCodeAt(0));

for (let i = 2; i < prg.length; i++) {
    comp.mem.setInt(comp.cpu.pc.int + i - 2, prg.substring(i, i + 1).charCodeAt(0));
    //console.log(comp.mem.int[comp.cpu.pc.int + i - 2].toString(16).toUpperCase().padStart(2, '0'));
}

while (true) {
    comp.cpu.processInstruction();
    //console.log(comp.cpu.ir.getAsHexString());
    if (comp.cpu.ir.int === 0) {
        // BRK
        console.log(comp.cpu.a.int);
        break;
    }
    /*     if (comp.cpu.cycleCounter % 1_000_000 < 7) {
        console.log(comp.cpu.cycleCounter);
    } */
}
