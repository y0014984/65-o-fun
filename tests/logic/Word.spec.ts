import { describe, expect, it } from 'vitest';
import Word from '../../src/logic/Word';

describe('Word Class', () => {
    it('can create an instance', () => {
        const word = new Word(42, 2);

        expect(word.int[0]).toBe(256 * 2 + 42);
    });
});
