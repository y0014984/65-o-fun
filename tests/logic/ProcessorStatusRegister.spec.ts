import { describe, expect, it } from 'vitest';
import ProcessorStatusRegister from '../../src/logic/ProcessorStatusRegister';
import Byte from '../../src/logic/Byte';

describe('ProcessorStatusRegister Class', () => {
    it('can create an instance', () => {
        const byte = new ProcessorStatusRegister();

        expect(byte.getAsBitString()).toEqual('0b00110000');
    });

    it('can get N-O-E-B-D-I-Z-C flags', () => {
        const byte = new ProcessorStatusRegister();

        expect(byte.getNegativeFlag()).toBe(false);
        expect(byte.getOverflowFlag()).toBe(false);
        expect(byte.getExpansionBit()).toBe(true);
        expect(byte.getBreakFlag()).toBe(true);
        expect(byte.getDecimalFlag()).toBe(false);
        expect(byte.getInterruptFlag()).toBe(false);
        expect(byte.getZeroFlag()).toBe(false);
        expect(byte.getCarryFlag()).toBe(false);
    });

    it('can set N-O-E-B-D-I-Z-C flags', () => {
        const byte = new ProcessorStatusRegister();

        byte.setNegativeFlag(true);
        byte.setOverflowFlag(true);
        byte.setExpansionBit();
        byte.setBreakFlag(false);
        byte.setDecimalFlag(true);
        byte.setInterruptFlag(true);
        byte.setZeroFlag(true);
        byte.setCarryFlag(true);

        expect(byte.getNegativeFlag()).toBe(true);
        expect(byte.getOverflowFlag()).toBe(true);
        expect(byte.getExpansionBit()).toBe(true); // must always be true
        expect(byte.getBreakFlag()).toBe(false);
        expect(byte.getDecimalFlag()).toBe(true);
        expect(byte.getInterruptFlag()).toBe(true);
        expect(byte.getZeroFlag()).toBe(true);
        expect(byte.getCarryFlag()).toBe(true);
    });
});
