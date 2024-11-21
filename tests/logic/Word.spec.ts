import { describe, expect, it } from 'vitest';
import Word from '../../src/logic/Word';
import Byte from '../../src/logic/Byte';

describe('Word Class', () => {
    it('can create an instance', () => {
        const byte = new Word(new Byte(42), new Byte(2));

        expect(byte.getInt()).toBe(256 * 2 + 42);
    });
});
