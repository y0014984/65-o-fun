import { describe, expect, it } from 'vitest';
import Processor from '../../src/logic/Processor';
import Word from '../../src/logic/Word';
import Byte from '../../src/logic/Byte';

describe('Processor Class', () => {
    it('can create an instance', () => {
        const mem: Byte[] = [];
        const proc = new Processor(mem);

        expect(proc.a.getInt()).toBe(0);
    });

    it('can fetch the next instruction and operand', () => {
        const mem: Byte[] = [];
        for (let i = 0; i < 2; i++) {
            mem.push(new Byte());
        }
        mem[0].setAsHexString('0xa9'); // LDA IM
        mem[1].setAsHexString('0x2a'); // 2a = 42

        const proc = new Processor(mem);

        proc.fetchInstruction();

        expect(proc.ir.getAsHexString()).toEqual('0xa9');

        expect(proc.fetchByte().getAsHexString()).toEqual('0x2a');
    });
});
