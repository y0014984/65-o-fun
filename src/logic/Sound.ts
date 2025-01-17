import Memory from './Memory';

const registerWaveformDuration = 0x0224;
const registerStartStopFrequency = 0x0225; // Word

export default class Sound {
    private mem: Memory;
    private ctx: AudioContext;
    private duration: number = 0;
    private frequency: number = 0;
    private waveform: OscillatorType = 'sine';

    constructor(mem: Memory) {
        this.mem = mem;
        this.ctx = new AudioContext();
        this.init();
    }

    init() {
        this.updateWaveformDuration();

        this.updateStartStopFrequency();
    }

    start() {
        const osc = this.ctx.createOscillator();
        osc.type = this.waveform;
        osc.frequency.value = this.frequency;
        osc.connect(this.ctx.destination);
        osc.start();

        const classSound = this;
        // Beep for 500 milliseconds
        setTimeout(function () {
            osc.stop();
            classSound.mem.setInt(registerStartStopFrequency + 1, classSound.mem.int[registerStartStopFrequency + 1] & 0b01111111);
        }, this.duration); // Duration in ms
    }

    checkMemWrite(index: number) {
        if (index === registerWaveformDuration) this.updateWaveformDuration();
        if (index === registerStartStopFrequency || index === registerStartStopFrequency + 1) this.updateStartStopFrequency();
    }

    updateWaveformDuration() {
        // registerWaveformDuration
        // [2 Bits Waveform | 6 Bits Duration *10 in ms]
        let waveform: OscillatorType;
        switch ((this.mem.int[registerWaveformDuration] & 0b11000000) >> 6) {
            case 0:
                waveform = 'sine';
                break;
            case 1:
                waveform = 'square';
                break;
            case 2:
                waveform = 'sawtooth';
                break;
            case 3:
                waveform = 'triangle';
                break;

            default:
                waveform = 'sine';
                break;
        }

        this.waveform = waveform;

        this.duration = (this.mem.int[registerWaveformDuration] & 0b00111111) * 10;
    }

    updateStartStopFrequency() {
        // registerStartStopFrequency
        // [1 Bit Start/Stop | 7 Bits Frequency]
        this.frequency = ((this.mem.int[registerStartStopFrequency + 1] & 0b01111111) << 8) | this.mem.int[registerStartStopFrequency];

        if ((this.mem.int[registerStartStopFrequency + 1] & 0b10000000) >> 7 === 1) {
            this.start();
        }
    }
}
