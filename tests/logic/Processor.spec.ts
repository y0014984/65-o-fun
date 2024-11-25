import { describe, expect, it } from 'vitest';
import Processor from '../../src/logic/Processor';
import Computer from '../../src/logic/Computer';
import Byte from '../../src/logic/Byte';

describe('Processor Class', () => {
    it('can create an instance', () => {
        const comp = new Computer({ memorySize: 8, ctx: null });

        expect(comp.cpu.a.getInt()).toBe(0);
    });

    it('can fetch the next instruction and operand', () => {
        const comp = new Computer({ memorySize: 8, ctx: null });

        comp.mem.setAsHexString(0, 'A9'); // LDA #$nn
        comp.mem.setAsHexString(1, '2A'); // 2A = 42

        comp.cpu.fetchInstruction();

        expect(comp.cpu.ir.getAsHexString()).toEqual('A9');

        expect(comp.cpu.fetchByte().getAsHexString()).toEqual('2A');
    });

    describe('Opcodes', () => {
        it('can run instruction LDA #$nn', () => {
            const comp = new Computer({ memorySize: 8, ctx: null });
            comp.mem.setAsHexString(0, 'A9'); // LDA #$nn
            comp.mem.setAsHexString(1, '2A'); // 2A = 42

            comp.cpu.processInstruction();

            expect(comp.cpu.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $ll', () => {
            const comp = new Computer({ memorySize: 8, ctx: null });
            comp.mem.setAsHexString(0, 'A5'); // LDA $ll
            comp.mem.setAsHexString(1, '02'); // 02 = 2
            comp.mem.setAsHexString(2, '2A'); // 2A = 42

            comp.cpu.processInstruction();

            expect(comp.cpu.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $ll, X', () => {
            const comp = new Computer({ memorySize: 8, ctx: null });
            comp.mem.setAsHexString(0, 'B5'); // LDA $ll, X
            comp.mem.setAsHexString(1, '02'); // 02 = 2
            comp.mem.setAsHexString(2, '00'); // BRK
            comp.mem.setAsHexString(3, '2A'); // 2A = 42

            comp.cpu.x.setInt(1);

            comp.cpu.processInstruction();

            expect(comp.cpu.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $hhll', () => {
            const comp = new Computer({ ctx: null });

            comp.mem.setAsHexString(0, 'AD'); // LDA $hhll
            comp.mem.setAsHexString(1, 'FF'); // FF = 255
            comp.mem.setAsHexString(2, 'FF'); // FF = 255
            comp.mem.setAsHexString(65535, '2A'); // 2A = 42

            comp.cpu.processInstruction();

            expect(comp.cpu.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $hhll, X', () => {
            const comp = new Computer({ ctx: null });

            comp.mem.setAsHexString(0, 'BD'); // LDA $hhll, X
            comp.mem.setAsHexString(1, 'FE'); // FE = 254
            comp.mem.setAsHexString(2, 'FF'); // FF = 255
            comp.mem.setAsHexString(65535, '2A'); // 2A = 42

            comp.cpu.x.setInt(1);

            comp.cpu.processInstruction();

            expect(comp.cpu.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $hhll, Y', () => {
            const comp = new Computer({ ctx: null });

            comp.mem.setAsHexString(0, 'B9'); // LDA $hhll, Y
            comp.mem.setAsHexString(1, 'FE'); // FE = 254
            comp.mem.setAsHexString(2, 'FF'); // FF = 255
            comp.mem.setAsHexString(65535, '2A'); // 2A = 42

            comp.cpu.y.setInt(1);

            comp.cpu.processInstruction();

            expect(comp.cpu.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA ($ll, X)', () => {
            const comp = new Computer({ ctx: null });

            comp.mem.setAsHexString(0, 'A1'); // LDA ($ll, X)
            comp.mem.setAsHexString(1, '03'); // 03 = 3
            comp.mem.setAsHexString(2, '00'); // BRK
            comp.mem.setAsHexString(3, '00'); // BRK
            comp.mem.setAsHexString(4, 'FF'); // FF = 255
            comp.mem.setAsHexString(5, 'FF'); // FF = 255
            comp.mem.setAsHexString(65535, '2A'); // 2A = 42

            comp.cpu.x.setInt(1);

            comp.cpu.processInstruction();

            expect(comp.cpu.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA ($ll), Y', () => {
            const comp = new Computer({ ctx: null });

            comp.mem.setAsHexString(0, 'B1'); // LDA ($ll), Y
            comp.mem.setAsHexString(1, '04'); // 04 = 4
            comp.mem.setAsHexString(2, '00'); // BRK
            comp.mem.setAsHexString(3, '00'); // BRK
            comp.mem.setAsHexString(4, 'FE'); // FE = 254
            comp.mem.setAsHexString(5, 'FF'); // FF = 255
            comp.mem.setAsHexString(65535, '2A'); // 2A = 42

            comp.cpu.y.setInt(1);

            comp.cpu.processInstruction();

            expect(comp.cpu.a.getAsHexString()).toEqual('2A');
        });
    });
});
