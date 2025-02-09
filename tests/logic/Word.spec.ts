import { describe, expect, it } from 'vitest';
import Word from '../../src/logic/Word';
import Byte from '../../src/logic/Byte';

describe('Word Class', () => {
    it('can create an instance', () => {
        const word = new Word(42, 2);

        expect(word.int).toBe(256 * 2 + 42);
    });
});
