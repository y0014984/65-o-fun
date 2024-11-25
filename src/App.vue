<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { references } from './logic/Reference.ts';
import Computer from './logic/Computer.ts';

const width: number = 320;
const height: number = 240;

const comp = ref<Computer>(new Computer({ monitorWidth: width, monitorHeight: height, ctx: null }));

comp.value.mem.setAsHexString(0, 'A9'); // LDA $nn
comp.value.mem.setAsHexString(1, '41'); // hex 41 = ASCII 'A'

comp.value.mem.setAsHexString(2, '8D'); // STA $0400
comp.value.mem.setAsHexString(3, '20'); //
comp.value.mem.setAsHexString(4, '04'); //

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);
const uploadDataDisabled = ref(true);

const loadAddressLowByte = ref('00');
const loadAddressHighByte = ref('00');

function startProcessor() {
    comp.value.cpu.startProcessor();
}

function stopProcessor() {
    comp.value.cpu.stopProcessor();
}

function executeNextInstruction() {
    comp.value.cpu.processInstruction();
}

function resetRegisters() {
    comp.value.cpu.initRegisters();
}

function clearMemory() {
    for (let i = 0; i < 65536; i++) {
        comp.value.mem.setInt(i, 0);
    }
}

async function uploadData() {
    comp.value.cpu.pc.highByte.setAsHexString(loadAddressHighByte.value);
    comp.value.cpu.pc.lowByte.setAsHexString(loadAddressLowByte.value);

    if (file.value) {
        const reader = file.value.stream().getReader();

        // TODO: handle if more then one chunk is send; chunk size is currently 65636 bytes
        while (true) {
            const { done, value } = await reader.read();
            if (value) importData(value);
            if (done) break;
        }
    }

    if (fileSelector.value) {
        fileSelector.value.value = '';
        uploadDataDisabled.value = true;
        loadAddressHighByte.value = '00';
        loadAddressLowByte.value = '00';
    }
}

function importData(value: Uint8Array) {
    // value comes in chunks of 65536
    value.forEach((element, index) => {
        comp.value.mem.setInt(comp.value.cpu.pc.getInt() + index, element);
    });
}

function onFileChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        file.value = target.files[0];
    }

    uploadDataDisabled.value = target.value === '' ? true : false;
}

function onHexInputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target) {
        target.value = (parseInt(target.value, 16) % 256).toString(16).toUpperCase();
        if (target.value === 'NAN') target.value = '00';
    }
}

// TODO: create mem view as table of inputs instead of paragraph to allow changing values on the fly

function addressToHex(value: number) {
    return value.toString(16).toUpperCase().padStart(4, '0');
}

const memView = computed(() => {
    const memView: string[] = [];
    comp.value.mem.getMemArray().forEach((element, index) => {
        if (comp.value.cpu.pc.getInt() === index) memView.push('<b>');
        memView.push(element.getAsHexString());
        if (comp.value.cpu.pc.getInt() === index) memView.push('</b>');
        if ((index + 1) % 16 === 0) {
            memView.push(` | ${addressToHex(index - 15)}-${addressToHex(index)}<br/>`);
        }
        if ((index + 1) % 256 === 0) {
            memView.push('-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- | --------- <br/>');
        }
    });
    return memView.join(' ');
});

const opcode = computed(() => {
    return comp.value.mem.getAsHexString(comp.value.cpu.pc.getInt());
});

const assembly = computed(() => {
    return references.find(element => element.opc === opcode.value)?.assembly;
});

const operand = computed(() => {
    const instructions = references.filter(element => element.opc === opcode.value);
    let operand = '';
    instructions.forEach(element => {
        for (let i = 1; i < element.bytes; i++) {
            operand = operand.concat(` ${comp.value.mem.getAsHexString(comp.value.cpu.pc.getInt() + i)}`);
        }
    });
    return operand;
});

onMounted(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    comp.value.gfx.setCtx(ctx);

    comp.value.gfx.drawBackground();
});
</script>

<template>
    <div class="app">
        <div>
            <button type="button" @click="resetRegisters()">Reset</button>
            <table>
                <tbody>
                    <tr>
                        <th>A</th>
                        <th>X</th>
                        <th>Y</th>
                        <th>S</th>
                        <th>P</th>
                        <th>PC</th>
                    </tr>
                    <tr>
                        <td class="registers">{{ comp.cpu.a.getAsHexString() }}</td>
                        <td class="registers">{{ comp.cpu.x.getAsHexString() }}</td>
                        <td class="registers">{{ comp.cpu.y.getAsHexString() }}</td>
                        <td class="registers">{{ comp.cpu.s.getAsHexString() }}</td>
                        <td class="registers">{{ comp.cpu.p.getAsHexString() }}</td>
                        <td class="pc">
                            {{ comp.cpu.pc.lowByte.getAsHexString() }}
                            {{ comp.cpu.pc.highByte.getAsHexString() }}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table>
                <tbody>
                    <tr>
                        <th>N</th>
                        <th>V</th>
                        <th>1</th>
                        <th>B</th>
                        <th>D</th>
                        <th>I</th>
                        <th>Z</th>
                        <th>C</th>
                    </tr>
                    <tr>
                        <td>{{ comp.cpu.p.getNegativeFlag() ? '1' : '0' }}</td>
                        <td>{{ comp.cpu.p.getOverflowFlag() ? '1' : '0' }}</td>
                        <td>{{ comp.cpu.p.getExpansionBit() ? '1' : '0' }}</td>
                        <td>{{ comp.cpu.p.getBreakFlag() ? '1' : '0' }}</td>
                        <td>{{ comp.cpu.p.getDecimalFlag() ? '1' : '0' }}</td>
                        <td>{{ comp.cpu.p.getInterruptFlag() ? '1' : '0' }}</td>
                        <td>{{ comp.cpu.p.getZeroFlag() ? '1' : '0' }}</td>
                        <td>{{ comp.cpu.p.getCarryFlag() ? '1' : '0' }}</td>
                    </tr>
                </tbody>
            </table>
            <p>Next Instruction: {{ assembly }} ({{ opcode }}:{{ operand }})</p>
            <button type="button" @click="executeNextInstruction()">Execute</button>
            <button type="button" @click="startProcessor()">Start</button>
            <button type="button" @click="stopProcessor()">Stop</button>
            <p>executionTimeLastInstruction (Milliseconds): {{ comp.cpu.executionTimeLastInstruction }}</p>
            <p>Cycles: {{ comp.cpu.cycleCounter }}</p>
            <p>Instructions: {{ comp.cpu.instructionCounter }}</p>
            <canvas id="canvas" width="320" height="240"></canvas>
        </div>
        <div style="overflow-y: scroll; height: 100vh">
            <div class="memory">
                <div>
                    <button type="button" @click="clearMemory()">Clear</button>
                </div>
                <div>
                    <button type="button" @click="uploadData()" :disabled="uploadDataDisabled">Upload</button>
                    <input type="file" @change="onFileChanged($event)" accept=".bin" ref="fileSelector" />
                </div>
                <div>
                    <span>H</span>
                    <input type="text" @change="onHexInputChanged($event)" :disabled="uploadDataDisabled" v-model="loadAddressHighByte" />
                    <span>L</span>
                    <input type="text" @change="onHexInputChanged($event)" :disabled="uploadDataDisabled" v-model="loadAddressLowByte" />
                </div>
            </div>
            <p class="monospaced" v-html="memView" v-cloak></p>
        </div>
    </div>
</template>

<style>
.app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 15px;
    padding: 10px;
}

.memory {
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
}

canvas {
    border: 1px solid black;
    width: 640px;
    height: 480px;
}

table,
th,
td {
    border: 1px solid black;
    border-collapse: collapse;
}

table {
    margin-bottom: 10px;
}

td {
    min-width: 1rem;
    text-align: center;
}

.registers {
    min-width: 2rem;
}

.pc {
    min-width: 4rem;
}

b {
    color: red;
}
</style>
