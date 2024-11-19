import Byte from './Byte';

export default class Word {
    lowByte: Byte = new Byte();
    highByte: Byte = new Byte();

    getAsNumber() {
        return this.lowByte.byte + 256 * this.highByte.byte;
    }
}
