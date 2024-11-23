<script setup lang="ts">
import { computed, ref } from 'vue';
import Byte from './logic/Byte.ts';
import Processor from './logic/Processor.ts';
import { references } from './logic/Reference.ts';

const mem: Byte[] = [];

for (let i = 0; i < 65536; i++) {
    mem.push(new Byte());
}
mem[0].setAsHexString('A9'); // LDA IM
mem[1].setAsHexString('2A'); // 2A = 42

mem[2].setAsHexString('85'); // STA ZP
mem[3].setAsHexString('FF'); // FF

mem[4].setAsHexString('E6'); // INC ZP
mem[5].setAsHexString('FF'); // FF

mem[6].setAsHexString('20'); // JSR
mem[7].setAsHexString('0E'); // 0E = 14
mem[8].setAsHexString('00'); // 00

mem[9].setAsHexString('E6'); // INC ZP
mem[10].setAsHexString('FF'); // FF

mem[11].setAsHexString('4C'); // JMP
mem[12].setAsHexString('11'); // 11 = 17
mem[13].setAsHexString('00'); // 00

mem[14].setAsHexString('E6'); // INC ZP
mem[15].setAsHexString('FF'); // FF
mem[16].setAsHexString('60'); // RTS

mem[17].setAsHexString('18'); // CLC

mem[18].setAsHexString('69'); // ADC IMM
mem[19].setAsHexString('0A'); // 0A = 10

mem[20].setAsHexString('38'); // SEC

mem[21].setAsHexString('E9'); // SBC IMM
mem[22].setAsHexString('88'); // 88 = 136

mem[23].setAsHexString('85'); // STA ZP
mem[24].setAsHexString('FF'); // FF

const proc = ref<Processor>(new Processor(mem));

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);
const uploadDataDisabled = ref(true);

const loadAddressLowByte = ref('00');
const loadAddressHighByte = ref('00');

function executeNextInstruction() {
    proc.value.processInstruction();
}

function resetRegisters() {
    proc.value.initRegisters();
}

function clearMemory() {
    for (let i = 0; i < 65536; i++) {
        proc.value.mem[i].setInt(0);
    }
}

async function uploadData() {
    proc.value.pc.highByte.setAsHexString(loadAddressHighByte.value);
    proc.value.pc.lowByte.setAsHexString(loadAddressLowByte.value);

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
        proc.value.mem[proc.value.pc.getInt() + index].setInt(element);
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
    proc.value.mem.forEach((element, index) => {
        if (proc.value.pc.getInt() === index) memView.push('<b>');
        memView.push(element.getAsHexString());
        if (proc.value.pc.getInt() === index) memView.push('</b>');
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
    return proc.value.mem[proc.value.pc.getInt()].getAsHexString();
});

const assembly = computed(() => {
    return references.find(element => element.opc === opcode.value)?.assembly;
});

const operand = computed(() => {
    const instructions = references.filter(element => element.opc === opcode.value);
    let operand = '';
    instructions.forEach(element => {
        for (let i = 1; i < element.bytes; i++) {
            operand = operand.concat(` ${proc.value.mem[proc.value.pc.getInt() + i].getAsHexString()}`);
        }
    });
    return operand;
});
</script>

<template>
    <div class="app">
        <div class="processor">
            <h1>65-o-fun</h1>
            <h2>Registers</h2>
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
                        <td class="registers">{{ proc.a.getAsHexString() }}</td>
                        <td class="registers">{{ proc.x.getAsHexString() }}</td>
                        <td class="registers">{{ proc.y.getAsHexString() }}</td>
                        <td class="registers">{{ proc.s.getAsHexString() }}</td>
                        <td class="registers">{{ proc.p.getAsHexString() }}</td>
                        <td class="pc">
                            {{ proc.pc.lowByte.getAsHexString() }}
                            {{ proc.pc.highByte.getAsHexString() }}
                        </td>
                    </tr>
                </tbody>
            </table>
            <h2>Processor Status Register</h2>
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
                        <td>{{ proc.p.getNegativeFlag() ? '1' : '0' }}</td>
                        <td>{{ proc.p.getOverflowFlag() ? '1' : '0' }}</td>
                        <td>{{ proc.p.getExpansionBit() ? '1' : '0' }}</td>
                        <td>{{ proc.p.getBreakFlag() ? '1' : '0' }}</td>
                        <td>{{ proc.p.getDecimalFlag() ? '1' : '0' }}</td>
                        <td>{{ proc.p.getInterruptFlag() ? '1' : '0' }}</td>
                        <td>{{ proc.p.getZeroFlag() ? '1' : '0' }}</td>
                        <td>{{ proc.p.getCarryFlag() ? '1' : '0' }}</td>
                    </tr>
                </tbody>
            </table>
            <h2>Next Instruction: {{ assembly }} ({{ opcode }}:{{ operand }})</h2>
            <button type="button" @click="executeNextInstruction()">Execute</button>
            <h2>Memory</h2>
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
        </div>
        <div style="overflow-y: scroll; height: 100vh">
            <p class="monospaced" v-html="memView"></p>
        </div>
    </div>
</template>

<style>
.app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 15px;
}

.processor {
    padding: 10px;
}

.memory {
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
}

table,
th,
td {
    border: 1px solid black;
    border-collapse: collapse;
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
