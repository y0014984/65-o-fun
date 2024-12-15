<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { references } from '../logic/Reference.ts';
import { Computer, Status } from '../logic/Computer.ts';
import Registers from '../components/Registers.vue';
import Memory from '../components/Memory.vue';

const width: number = 320;
const height: number = 240;

const comp = ref<Computer>(new Computer({ monitorWidth: width, monitorHeight: height }));

function turnOnComputer() {
    comp.value.turnOn();
}

function turnOffComputer() {
    comp.value.turnOff();
}

function executeNextInstruction() {
    comp.value.cpu.processInstruction();
}

function reset() {
    comp.value.turnOff();
    comp.value.cpu.cycleCounter = 0;
    comp.value.cpu.instructionCounter = 0;
    comp.value.cpu.initRegisters();
    comp.value.mem.reset();
    resetGfx();
}

function resetGfx() {
    if (comp.value.gfx) {
        comp.value.gfx.drawBackground();
    }
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

const powerColor = computed(() => {
    return comp.value.status === Status.ON ? 'green' : 'red';
});

document.addEventListener('keydown', event => {
    comp.value.keyEvent('down', event.code);
});

document.addEventListener('keyup', event => {
    comp.value.keyEvent('up', event.code);
});

onMounted(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    if (comp.value.gfx) {
        comp.value.gfx.setCtx(ctx);
    }
    resetGfx();
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
            <button type="button" @click="reset()" :disabled="comp.status === Status.ON">Reset</button>
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
        <div v-if="comp.status === Status.OFF">
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
