import { describe, expect, it } from 'vitest';
import Byte from '../../src/logic/Byte';

describe('Byte Class', () => {
    it('can create an instance', () => {
        const byte = new Byte(42);

        expect(byte.int[0]).toBe(42);
        expect(byte.getAsBitString()).toEqual('00101010');
        expect(byte.getAsHexString()).toEqual('2A');
    });

    it('can be modified by setting int', () => {
        const byte = new Byte(23);
        byte.setInt(42);

        expect(byte.int[0]).toBe(42);
        expect(byte.getAsBitString()).toEqual('00101010');
        expect(byte.getAsHexString()).toEqual('2A');
    });

    it('can be modified by setting as hex string', () => {
        const byte = new Byte(23);
        byte.setAsHexString('2A');

        expect(byte.int[0]).toBe(42);
        expect(byte.getAsBitString()).toEqual('00101010');
        expect(byte.getAsHexString()).toEqual('2A');
    });

    it('can be modified by setting as bit string', () => {
        const byte = new Byte(23);
        byte.setAsBitString('00101010');

        expect(byte.int[0]).toBe(42);
        expect(byte.getAsBitString()).toEqual('00101010');
        expect(byte.getAsHexString()).toEqual('2A');
    });

    it('fixes overflows', () => {
        const byte = new Byte(256);

        expect(byte.int[0]).toBe(0);
    });

    it('fixes negative overflows', () => {
        const byte = new Byte(-1);

        expect(byte.int[0]).toBe(255);
    });
});
