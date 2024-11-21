import { describe, expect, it } from 'vitest';
import Byte from '../../src/logic/Byte';

describe('Byte Class', () => {
    it('can create an instance', () => {
        const byte = new Byte(42);

        expect(byte.getInt()).toBe(42);
        expect(byte.getBitArray()).toEqual([false, true, false, true, false, true, false, false]);
        expect(byte.getBitByIndex(1)).toBe(true);
        expect(byte.getAsBitString()).toEqual('0b00101010');
        expect(byte.getAsHexString()).toEqual('0x2a');
    });

    it('can be modified by setting int', () => {
        const byte = new Byte(23);
        byte.setInt(42);

        expect(byte.getInt()).toBe(42);
        expect(byte.getBitArray()).toEqual([false, true, false, true, false, true, false, false]);
        expect(byte.getBitByIndex(1)).toBe(true);
        expect(byte.getAsBitString()).toEqual('0b00101010');
        expect(byte.getAsHexString()).toEqual('0x2a');
    });

    it('can be modified by setting bit', () => {
        const byte = new Byte(42);
        byte.setBitByIndex(0, true);

        expect(byte.getInt()).toBe(43);
        expect(byte.getBitArray()).toEqual([true, true, false, true, false, true, false, false]);
        expect(byte.getBitByIndex(0)).toBe(true);
        expect(byte.getAsBitString()).toEqual('0b00101011');
        expect(byte.getAsHexString()).toEqual('0x2b');
    });

    it('can be modified by setting as hex string', () => {
        const byte = new Byte(23);
        byte.setAsHexString('0x2a');

        expect(byte.getInt()).toBe(42);
        expect(byte.getBitArray()).toEqual([false, true, false, true, false, true, false, false]);
        expect(byte.getBitByIndex(1)).toBe(true);
        expect(byte.getAsBitString()).toEqual('0b00101010');
        expect(byte.getAsHexString()).toEqual('0x2a');
    });

    it('can be modified by setting as bit string', () => {
        const byte = new Byte(23);
        byte.setAsBitString('0b00101010');

        expect(byte.getInt()).toBe(42);
        expect(byte.getBitArray()).toEqual([false, true, false, true, false, true, false, false]);
        expect(byte.getBitByIndex(1)).toBe(true);
        expect(byte.getAsBitString()).toEqual('0b00101010');
        expect(byte.getAsHexString()).toEqual('0x2a');
    });

    it('it can return signed int of negative value', () => {
        const byte = new Byte(255);

        expect(byte.getAsSignedInt()).toBe(-1);
    });

    it('it can return signed int of positive value', () => {
        const byte = new Byte(42);

        expect(byte.getAsSignedInt()).toBe(42);
    });

    it('fixes overflows', () => {
        const byte = new Byte(256);

        expect(byte.getInt()).toBe(0);
    });

    it('fixes negative overflows', () => {
        const byte = new Byte(-1);

        expect(byte.getInt()).toBe(255);
    });
});
