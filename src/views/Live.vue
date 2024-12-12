<script setup lang="ts">
import { ref } from 'vue';
import { Computer } from '../logic/Computer.ts';

const comp = new Computer({ monitorWidth: 320, monitorHeight: 240 });

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);
const uploadDataDisabled = ref(true);

let loadAddressLowByte = '00';
let loadAddressHighByte = '00';

let isRunning = false;

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

        startProcessor();
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

const stopCondition = () => (comp.cpu.instructionCounter > 0 && comp.cpu.ir.int === 0) || !isRunning;
const yieldCondition = () => comp.cpu.cycleCounter % 1_000_000 < 7;

const loop = (): void => {
    comp.cpu.processInstruction();

    // Update DOM if we're about to yield
    if (yieldCondition()) {
        console.log(comp.cpu.cycleCounter);
        updateOutput(comp.cpu.cycleCounter.toString());
    }

    // Update DOM if we're about to stop
    if (stopCondition()) {
        updateOutput(`A: ${comp.cpu.a.int}`);
    }
};

function doUntil(loop: () => void, stopCondition: () => boolean, yieldCondition: () => boolean): Promise<void> {
    // Wrap function in promise so it can run asynchronously
    return new Promise((resolve, _reject) => {
        // Build outerLoop function to pass to setTimeout
        let outerLoop = function () {
            while (true) {
                // Execute a single inner loop iteration
                loop();

                if (stopCondition()) {
                    // Resolve promise, exit outer loop,
                    // and do not re-enter
                    resolve();
                    break;
                } else if (yieldCondition()) {
                    // Exit outer loop and queue up next
                    // outer loop iteration for next event loop cycle
                    setTimeout(outerLoop, 0);
                    break;
                }

                // Continue to next inner loop iteration
                // without yielding
            }
        };

        // Start the first iteration of outer loop,
        // unless the stop condition is met
        if (!stopCondition()) {
            setTimeout(outerLoop, 0);
        }
    });
}

function startProcessor() {
    console.log('startProcessor()');

    isRunning = true;
    doUntil(loop, stopCondition, yieldCondition);
}

async function updateOutput(value: string) {
    const output: HTMLParagraphElement = document.getElementById('output') as HTMLParagraphElement;
    output.textContent = value;
}
</script>

<template>
    <div>
        <p id="output">Output</p>
        <p>isRunning: {{ isRunning }}</p>
    </div>
    <div style="overflow-y: scroll; height: 100vh">
        <div class="memory">
            <div>
                <button type="button" @click="uploadData()" :disabled="uploadDataDisabled">Upload</button>
                <input type="file" @change="onFileChanged($event)" accept=".bin,.prg" ref="fileSelector" />
            </div>
        </div>
    </div>
</template>

<style>
canvas {
    border: 1px solid black;
    width: 640px;
    height: 480px;
}
</style>
