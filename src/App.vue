<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, watch } from 'vue';
import { references } from './logic/Reference.ts';
import Computer from './logic/Computer.ts';

const width: number = 320;
const height: number = 240;

const comp = ref<Computer>(new Computer({ monitorWidth: width, monitorHeight: height, ctx: null }));

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);
const uploadDataDisabled = ref(true);

const loadAddressLowByte = ref('00');
const loadAddressHighByte = ref('00');

const memPageIndex = ref(0);
const memPageIndexHex = ref('00');

watch(memPageIndexHex, newHex => {
    memPageIndex.value = parseInt(newHex, 16);
});

watch(memPageIndex, newIndex => {
    memPageIndexHex.value = newIndex.toString(16).toUpperCase().padStart(2, '0');
    if (memPageIndexHex.value === 'NAN') memPageIndexHex.value = '00';
});

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
        target.value = (parseInt(target.value, 16) % 256).toString(16).toUpperCase().padStart(2, '0');
        if (target.value === 'NAN') target.value = '00';
    }
}

function onMemInputChanged($event: Event) {
    onHexInputChanged($event);

    const target = $event.target as HTMLInputElement;

    if (target) {
        const memIndex = parseInt(target.dataset.index || '0') + memPageIndex.value * 256;
        comp.value.mem.setAsHexString(memIndex, target.value);
    }
}

function addressToHex(value: number) {
    return value.toString(16).toUpperCase().padStart(4, '0');
}

/* const memView: ComputedRef<string> = computed(() => {
    const tmpMemView: string[] = [];

    comp.value.mem.getMemArray().forEach((element, index) => {
        if (comp.value.cpu.pc.getInt() === index) tmpMemView.push('<b>');
        tmpMemView.push(element.getAsHexString());
        if (comp.value.cpu.pc.getInt() === index) tmpMemView.push('</b>');
        if ((index + 1) % 16 === 0) {
            tmpMemView.push(` | ${addressToHex(index - 15)}-${addressToHex(index)}<br/>`);
        }
        if ((index + 1) % 256 === 0) {
            tmpMemView.push('-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- | --------- <br/>');
        }
    });

    return tmpMemView.join(' ');
}); */

const memPage: ComputedRef<string[]> = computed(() => {
    const tmpMemPage: string[] = [];

    comp.value.mem.getMemArray().forEach((element, index) => {
        const indexFirstElement = memPageIndex.value * 256;
        const indexLastElement = memPageIndex.value * 256 + 255;
        if (index >= indexFirstElement && index <= indexLastElement) tmpMemPage.push(element.getAsHexString());
    });

    return tmpMemPage;
});

function increaseMemPageIndex() {
    if (memPageIndex.value < 63) memPageIndex.value++;
}

function decreaseMemPageIndex() {
    if (memPageIndex.value > 0) memPageIndex.value--;
}

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

async function requestFullscreen() {
    await document.documentElement.requestFullscreen();
    /*     if ('keyboard' in navigator && 'lock' in navigator.keyboard) {
        await navigator.keyboard.lock(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
    } else {
        alert('Keyboard API not supported.');
    } */
}

document.addEventListener('keydown', event => {
    /*     console.log(`Alt: ${event.altKey}`);
    console.log(`Ctrl: ${event.ctrlKey}`);
    console.log(`Meta: ${event.metaKey}`);
    console.log(`Shift: ${event.shiftKey}`);
    console.log(`Code: ${event.code}`);
    console.log(`Key: ${event.key}`); */
    comp.value.keyDown(event.code);
});

onMounted(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    comp.value.gfx.setCtx(ctx);

    comp.value.gfx.drawBackground();

    comp.value.mem.setInt(0, 255);
});
</script>

<template>
    <div class="app">
        <div>
            <button type="button" @click="requestFullscreen()">Fullscreen</button>
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
                    <span>Load file at memory address </span>
                    <span>H</span>
                    <input
                        class="hexInput"
                        type="text"
                        @change="onHexInputChanged($event)"
                        :disabled="uploadDataDisabled"
                        v-model="loadAddressHighByte"
                    />
                    <span>L</span>
                    <input
                        class="hexInput"
                        type="text"
                        @change="onHexInputChanged($event)"
                        :disabled="uploadDataDisabled"
                        v-model="loadAddressLowByte"
                    />
                </div>
                <div>
                    <button type="button" @click="decreaseMemPageIndex()">Prev</button>
                    <button type="button" @click="increaseMemPageIndex()">Next</button>
                    <span style="margin-right: 5px">Memory Page</span>
                    <input class="hexInput" type="text" @change="onHexInputChanged($event)" v-model="memPageIndexHex" />
                </div>
            </div>
            <div class="memView" v-for="(value, index) in memPage">
                <input
                    style="color: red"
                    class="hexInput"
                    type="text"
                    @change="onMemInputChanged($event)"
                    maxlength="2"
                    :data-index="index"
                    :value="value"
                    v-if="index + memPageIndex * 256 === comp.cpu.pc.getInt()"
                />
                <input
                    class="hexInput"
                    type="text"
                    @change="onMemInputChanged($event)"
                    maxlength="2"
                    :data-index="index"
                    :value="value"
                    v-else
                />
                <span v-if="(index + 1) % 16 === 0">
                    <span> | {{ addressToHex(index - 15 + memPageIndex * 256) }}-{{ addressToHex(index + memPageIndex * 256) }} </span>
                    <br />
                </span>
            </div>
            <!-- <p class="monospaced" v-html="memView" v-if="!comp.cpu.isRunning"></p> -->
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
    grid-template-rows: 1fr 1fr 1fr 1fr;
}

.memView {
    display: inline;
}

canvas {
    border: 1px solid black;
    width: 640px;
    height: 480px;
}

.hexInput {
    font-family: monospace;
    width: 1rem;
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
