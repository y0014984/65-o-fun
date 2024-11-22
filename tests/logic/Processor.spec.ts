import { describe, expect, it } from 'vitest';
import Processor from '../../src/logic/Processor';
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
        mem[0].setAsHexString('A9'); // LDA #$nn
        mem[1].setAsHexString('2A'); // 2A = 42

        const proc = new Processor(mem);

        proc.fetchInstruction();

        expect(proc.ir.getAsHexString()).toEqual('A9');

        expect(proc.fetchByte().getAsHexString()).toEqual('2A');
    });

    describe('Opcodes', () => {
        it('can run instruction LDA #$nn', () => {
            const mem: Byte[] = [];
            for (let i = 0; i < 2; i++) {
                mem.push(new Byte());
            }
            mem[0].setAsHexString('A9'); // LDA #$nn
            mem[1].setAsHexString('2A'); // 2A = 42

            const proc = new Processor(mem);

            proc.processInstruction();

            expect(proc.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $ll', () => {
            const mem: Byte[] = [];
            for (let i = 0; i < 3; i++) {
                mem.push(new Byte());
            }
            mem[0].setAsHexString('A5'); // LDA $ll
            mem[1].setAsHexString('02'); // 02 = 2
            mem[2].setAsHexString('2A'); // 2A = 42

            const proc = new Processor(mem);

            proc.processInstruction();

            expect(proc.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $ll, X', () => {
            const mem: Byte[] = [];
            for (let i = 0; i < 4; i++) {
                mem.push(new Byte());
            }
            mem[0].setAsHexString('B5'); // LDA $ll, X
            mem[1].setAsHexString('02'); // 02 = 2
            mem[2].setAsHexString('00'); // BRK
            mem[3].setAsHexString('2A'); // 2A = 42

            const proc = new Processor(mem);

            proc.x.setInt(1);

            proc.processInstruction();

            expect(proc.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $hhll', () => {
            const mem: Byte[] = [];
            for (let i = 0; i < 65536; i++) {
                mem.push(new Byte());
            }
            mem[0].setAsHexString('AD'); // LDA $hhll
            mem[1].setAsHexString('FF'); // FF = 255
            mem[2].setAsHexString('FF'); // FF = 255
            mem[65535].setAsHexString('2A'); // 2A = 42

            const proc = new Processor(mem);

            proc.processInstruction();

            expect(proc.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $hhll, X', () => {
            const mem: Byte[] = [];
            for (let i = 0; i < 65536; i++) {
                mem.push(new Byte());
            }
            mem[0].setAsHexString('BD'); // LDA $hhll, X
            mem[1].setAsHexString('FE'); // FE = 254
            mem[2].setAsHexString('FF'); // FF = 255
            mem[65535].setAsHexString('2A'); // 2A = 42

            const proc = new Processor(mem);

            proc.x.setInt(1);

            proc.processInstruction();

            expect(proc.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA $hhll, Y', () => {
            const mem: Byte[] = [];
            for (let i = 0; i < 65536; i++) {
                mem.push(new Byte());
            }
            mem[0].setAsHexString('B9'); // LDA $hhll, Y
            mem[1].setAsHexString('FE'); // FE = 254
            mem[2].setAsHexString('FF'); // FF = 255
            mem[65535].setAsHexString('2A'); // 2A = 42

            const proc = new Processor(mem);

            proc.y.setInt(1);

            proc.processInstruction();

            expect(proc.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA ($ll, X)', () => {
            const mem: Byte[] = [];
            for (let i = 0; i < 65536; i++) {
                mem.push(new Byte());
            }
            mem[0].setAsHexString('A1'); // LDA ($ll, X)
            mem[1].setAsHexString('03'); // 03 = 3
            mem[2].setAsHexString('00'); // BRK
            mem[3].setAsHexString('00'); // BRK
            mem[4].setAsHexString('FF'); // FF = 255
            mem[5].setAsHexString('FF'); // FF = 255
            mem[65535].setAsHexString('2A'); // 2A = 42

            const proc = new Processor(mem);

            proc.x.setInt(1);

            proc.processInstruction();

            expect(proc.a.getAsHexString()).toEqual('2A');
        });

        it('can run instruction LDA ($ll), Y', () => {
            const mem: Byte[] = [];
            for (let i = 0; i < 65536; i++) {
                mem.push(new Byte());
            }
            mem[0].setAsHexString('B1'); // LDA ($ll), Y
            mem[1].setAsHexString('04'); // 04 = 4
            mem[2].setAsHexString('00'); // BRK
            mem[3].setAsHexString('00'); // BRK
            mem[4].setAsHexString('FE'); // FE = 254
            mem[5].setAsHexString('FF'); // FF = 255
            mem[65535].setAsHexString('2A'); // 2A = 42

            const proc = new Processor(mem);

            proc.y.setInt(1);

            proc.processInstruction();

            expect(proc.a.getAsHexString()).toEqual('2A');
        });
    });
});
