<script setup lang="ts">
import { computed, onMounted, reactive, Ref, ref } from 'vue';
import { references } from '../logic/Reference.ts';
import { Computer, Status } from '../logic/Computer.ts';
import Registers from '../components/Registers.vue';
import Memory from '../components/Memory.vue';

const width = ref(320);
const height = ref(240);

const comp = ref(new Computer({})) as Ref<Computer>;

const memPageIndex = ref(0);
const memPageIndexHex = ref('00');

// @ts-ignore
if ('keyboard' in navigator && 'lock' in navigator.keyboard) navigator.keyboard.lock();

async function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }

    if (document && document.activeElement) (document.activeElement as HTMLElement).blur();
}

function reset() {
    comp.value.reset();

    if (document && document.activeElement) (document.activeElement as HTMLElement).blur();
}

function togglePower() {
    if (comp.value.status === Status.OFF) {
        comp.value.turnOn();
    } else {
        comp.value.turnOff();
    }

    if (document && document.activeElement) (document.activeElement as HTMLElement).blur();
}

function togglePausePlay() {
    if (comp.value.status === Status.BREAKPOINT) {
        comp.value.play();
    } else {
        comp.value.status = Status.BREAKPOINT;
    }
    if (document && document.activeElement) (document.activeElement as HTMLElement).blur();
}

function executeNextInstruction() {
    comp.value.executeNextInstruction();
}

const opcode = computed(() => {
    return comp.value.mem.getAsHexString(comp.value.cpu.pc.int[0]);
});

const assembly = computed(() => {
    return references.get(opcode.value).assembly;
});

const operand = computed(() => {
    const reference = references.get(opcode.value);
    let operand = '';
    for (let i = 1; i < reference.bytes; i++) {
        operand = operand.concat(` ${comp.value.mem.getAsHexString(comp.value.cpu.pc.int[0] + i)}`);
    }
    return operand;
});

document.addEventListener('keydown', event => {
    if (event.code === 'KeyB' && event.ctrlKey) {
        const activeElement = document.activeElement;
        if (activeElement === null) return; // no active element
        if (activeElement.tagName !== 'INPUT') return; // element type is not input
        if (isNaN(parseInt(activeElement.id, 16))) return; // id is not a hex number
        comp.value.toggleBreakpoint(parseInt(activeElement.id, 16));
        return;
    }
    comp.value.keyEvent('down', event.code);
});

document.addEventListener('keyup', event => {
    comp.value.keyEvent('up', event.code);
});

onMounted(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (comp.value.gfx) comp.value.gfx.setCanvas(canvas);
});

const powerColor = computed(() => {
    switch (comp.value.status) {
        case Status.ON:
            return 'green';
        case Status.OFF:
            return 'red';
        case Status.BREAKPOINT:
            return 'blue';
        default:
            return 'red';
    }
});

const powerLedStyle = reactive({
    backgroundColor: powerColor
});
</script>

<template>
    <div id="debug">
        <div id="canvas-div">
            <canvas id="canvas" :width="width" :height="height"></canvas>
        </div>
        <div id="computer-status">
            <button type="button" @click="toggleFullscreen()">Fullscreen</button>
            <button type="button" @click="reset()" :disabled="comp.status === Status.OFF || comp.status === Status.BREAKPOINT">
                Reset
            </button>
            <button type="button" @click="executeNextInstruction()" :disabled="comp.status === Status.ON || comp.status === Status.OFF">
                Next Instruction
            </button>
            <button type="button" @click="togglePausePlay()" :disabled="comp.status === Status.OFF">Pause/Play</button>
            <button type="button" @click="togglePower()">Power</button>
            <div id="power-led" :style="powerLedStyle"></div>
        </div>
        <div id="processor-status">
            <Registers v-model="comp" />
        </div>
        <p style="text-align: center">Next Instruction: {{ assembly }} ({{ opcode }}:{{ operand }})</p>
        <p style="text-align: center">
            Cycles: {{ comp.cpu.cycleCounter }} | FPS: {{ comp.currentFps.toFixed(2) }}/{{ comp.targetFps }} | kHz:
            {{ (comp.currentCyclesPerSec / 1_000).toFixed(2) }}/{{ comp.targetCyclesPerSec / 1_000 }}
        </p>
        <div v-if="comp.status === Status.OFF || comp.status === Status.BREAKPOINT">
            <Memory v-model:computer="comp" v-model:memPageIndex="memPageIndex" v-model:memPageIndexHex="memPageIndexHex" />
        </div>
    </div>
</template>

<style scoped>
#debug {
    padding: 10px;
    border: solid;
    margin: 5px;

    display: grid;
    grid-template-columns: 1fr;
    row-gap: 10px;
    justify-items: stretch;
}

#canvas-div {
    display: flex;
    justify-content: center;
    border: solid;
}

#canvas {
    width: 640px;
    height: 480px;
    margin: 10px;
}

#computer-status {
    display: flex;
    justify-self: center;
    justify-content: center;
    width: 640px;
    gap: 10px;
}

#power-led {
    width: 1rem;
    height: 1rem;
    margin-left: 5px;
    align-self: center;
    justify-self: center;
}
</style>
