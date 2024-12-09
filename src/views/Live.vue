<script setup lang="ts">
import { ref } from 'vue';
import Computer from '../logic/Computer.ts';

const comp = new Computer({ monitorWidth: 320, monitorHeight: 240, ctx: null });

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);
const uploadDataDisabled = ref(true);

const loadAddressLowByte = ref('00');
const loadAddressHighByte = ref('00');

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

        runProgram();
    }

    if (fileSelector.value) {
        fileSelector.value.value = '';
        uploadDataDisabled.value = true;
        loadAddressHighByte.value = '00';
        loadAddressLowByte.value = '00';
    }
}

function importBinData(value: Uint8Array) {
    comp.cpu.pc.setAsHexString(loadAddressLowByte.value, loadAddressHighByte.value);
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

function runProgram() {
    console.log('runProgram()');

    // TODO: call with setTimeout({}, 0) to allow rendering of the DOM
    while (true) {
        comp.cpu.processInstruction();
        //console.log(comp.cpu.ir.getAsHexString());
        if (comp.cpu.ir.int === 0) {
            // BRK
            console.log(comp.cpu.a.int);
            break;
        }
        if (comp.cpu.cycleCounter % 1_000_000 < 7) {
            console.log(comp.cpu.cycleCounter);
            updateOutput(comp.cpu.cycleCounter.toString());
        }
    }
}

async function updateOutput(value: string) {
    const output: HTMLParagraphElement = document.getElementById('output') as HTMLParagraphElement;
    output.textContent = value;
}
</script>

<template>
    <div>
        <p id="output"></p>
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
