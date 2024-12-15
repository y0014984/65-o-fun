<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Computer, Status } from '../logic/Computer.ts';

const comp = new Computer({ monitorWidth: 320, monitorHeight: 240, updateCallback: updateOutput });

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);
const uploadDataDisabled = ref(true);

let loadAddressLowByte = '00';
let loadAddressHighByte = '00';

const isRunning = ref(false);

const cycleCounter = ref(0);
const currentFps = ref(0);
const targetFps = ref(comp.targetFps);
const currentCyclesPerSec = ref(0);
const targetCyclesPerSec = ref(comp.targetCyclesPerSec);

async function updateOutput() {
    isRunning.value = comp.status === Status.ON;
    cycleCounter.value = comp.cpu.cycleCounter;
    currentFps.value = comp.currentFps;
    currentCyclesPerSec.value = comp.currentCyclesPerSec;
}

async function uploadData() {
    const suffix = file.value?.name.substring(file.value?.name.length - 4) || '.bin';

    if (file.value) {
        const reader = file.value.stream().getReader();

        // TODO: handle if more then one chunk is send; chunk size is currently 65636 bytes
        while (true) {
            const { done, value } = await reader.read();
            if (value) {
                if (suffix === '.bin') importBinData(value);
                if (suffix === '.prg') importPrgData(value);
            }
            if (done) break;
        }
    }

    if (fileSelector.value) {
        fileSelector.value.value = '';
        uploadDataDisabled.value = true;
        loadAddressHighByte = '00';
        loadAddressLowByte = '00';
    }
}

function importBinData(value: Uint8Array) {
    comp.cpu.pc.setAsHexString(loadAddressLowByte, loadAddressHighByte);
    // value comes in chunks of 65536
    value.forEach((element, index) => {
        comp.mem.setInt(comp.cpu.pc.int + index, element);
    });
}

function importPrgData(value: Uint8Array) {
    comp.cpu.pc.setInt(value[0], value[1]);
    // value comes in chunks of 65536
    value.forEach((element, index) => {
        if (index <= 1) return; // skip first two bytes
        const offset = -2; // offset -2 to compensate for 1st two bytes
        comp.mem.setInt(comp.cpu.pc.int + index + offset, element);
    });
}

function onFileChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        file.value = target.files[0];
    }

    uploadDataDisabled.value = target.value === '' ? true : false;
}

document.addEventListener('keydown', event => {
    comp.keyEvent('down', event.code);
});

document.addEventListener('keyup', event => {
    comp.keyEvent('up', event.code);
});

function turnOnComputer() {
    comp.turnOn();
}

function turnOffComputer() {
    comp.turnOff();
}

const powerColor = computed(() => {
    return isRunning.value ? 'green' : 'red';
});

const powerLedStyle = reactive({
    backgroundColor: powerColor
});

onMounted(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    if (comp.gfx) {
        comp.gfx.setCtx(ctx);
    }
    resetGfx();
});

function resetGfx() {
    if (comp.gfx) {
        comp.gfx.drawBackground();
    }
}
</script>

<template>
    <div id="live">
        <div id="canvas-div">
            <canvas id="canvas" width="320" height="240"></canvas>
        </div>
        <div id="computer-status">
            <button type="button" @click="turnOnComputer()" :disabled="isRunning">Turn on</button>
            <button type="button" @click="turnOffComputer()" :disabled="!isRunning">Turn off</button>
            <div id="power">
                <span>Power</span>
                <div id="power-led" :style="powerLedStyle"></div>
            </div>
        </div>
        <p style="text-align: center">
            Cycles: {{ cycleCounter }} | FPS: {{ currentFps.toFixed(2) }}/{{ targetFps }} | kHz:
            {{ (currentCyclesPerSec / 1_000).toFixed(2) }}/{{ targetCyclesPerSec / 1_000 }}
        </p>
        <div class="memory">
            <div>
                <button type="button" @click="uploadData()" :disabled="uploadDataDisabled">Upload</button>
                <input type="file" @change="onFileChanged($event)" accept=".bin,.prg" ref="fileSelector" />
            </div>
        </div>
    </div>
</template>

<style>
#live {
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
