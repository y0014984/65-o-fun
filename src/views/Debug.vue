<script setup lang="ts">
import { computed, onMounted, reactive, Ref, ref } from 'vue';
import { references } from '../logic/Reference.ts';
import { Computer, Status } from '../logic/Computer.ts';
import Registers from '../components/Registers.vue';
import Memory from '../components/Memory.vue';

const width: number = 320;
const height: number = 240;

const comp = ref(new Computer({ monitorWidth: width, monitorHeight: height })) as Ref<Computer>;

// @ts-ignore
if ('keyboard' in navigator && 'lock' in navigator.keyboard) navigator.keyboard.lock();

async function enableFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}

function resetComputer() {
    comp.value.reset();
}

function turnOnComputer() {
    comp.value.turnOn();
}

function turnOffComputer() {
    comp.value.turnOff();
}

function executeNextInstruction() {
    comp.value.executeNextInstruction();
}

const opcode = computed(() => {
    return comp.value.mem.getAsHexString(comp.value.cpu.pc.int);
});

const assembly = computed(() => {
    return references.get(opcode.value).assembly;
});

const operand = computed(() => {
    const reference = references.get(opcode.value);
    let operand = '';
    for (let i = 1; i < reference.bytes; i++) {
        operand = operand.concat(` ${comp.value.mem.getAsHexString(comp.value.cpu.pc.int + i)}`);
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
    const ctx = canvas.getContext('2d')!;
    if (comp.value.gfx) comp.value.gfx.setCtx(ctx);
    if (comp.value.gfx) comp.value.gfx.drawBackground();
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
            <canvas id="canvas" width="320" height="240"></canvas>
        </div>
        <div id="computer-status">
            <button type="button" @click="enableFullscreen()">Fullscreen</button>
            <button type="button" @click="resetComputer()" :disabled="comp.status === Status.ON || comp.status === Status.BREAKPOINT">
                Reset
            </button>
            <button type="button" @click="executeNextInstruction()" :disabled="comp.status === Status.ON">Next Instruction</button>
            <button type="button" @click="turnOnComputer()" :disabled="comp.status === Status.ON">Turn on</button>
            <button type="button" @click="turnOffComputer()" :disabled="comp.status === Status.OFF">Turn off</button>
            <div id="power">
                <span>Power</span>
                <div id="power-led" :style="powerLedStyle"></div>
            </div>
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
            <Memory v-model="comp" />
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

#power {
    display: flex;
    justify-content: center;
    align-items: center;
}

#power-led {
    width: 1rem;
    height: 1rem;
    margin-left: 5px;
}
</style>
