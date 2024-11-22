<script setup lang="ts">
import { computed, ref } from 'vue';
import Byte from './logic/Byte.ts';
import Processor from './logic/Processor.ts';
import { references } from './logic/Reference.ts';

const mem: Byte[] = [];

for (let i = 0; i < 65536; i++) {
    mem.push(new Byte());
}
mem[0].setAsHexString('0xa9'); // LDA IM
mem[1].setAsHexString('0x2a'); // 2a = 42

mem[2].setAsHexString('0x85'); // STA ZP
mem[3].setAsHexString('0xff'); // ff

mem[4].setAsHexString('0xe6'); // INC ZP
mem[5].setAsHexString('0xff'); // ff

mem[6].setAsHexString('0x20'); // JSR
mem[7].setAsHexString('0x0e'); // 0e = 14
mem[8].setAsHexString('0x00'); // 00

mem[9].setAsHexString('0xe6'); // INC ZP
mem[10].setAsHexString('0xff'); // ff

mem[11].setAsHexString('0x4c'); // JMP
mem[12].setAsHexString('0x11'); // 11 = 17
mem[13].setAsHexString('0x00'); // 00

mem[14].setAsHexString('0xe6'); // INC ZP
mem[15].setAsHexString('0xff'); // ff
mem[16].setAsHexString('0x60'); // RTS

mem[17].setAsHexString('0x18'); // CLC

mem[18].setAsHexString('0x69'); // ADC IMM
mem[19].setAsHexString('0x0a'); // 0a = 10

mem[20].setAsHexString('0x38'); // SEC

mem[21].setAsHexString('0xe9'); // SBC IMM
mem[22].setAsHexString('0x88'); // 88 = 136

mem[23].setAsHexString('0x85'); // STA ZP
mem[24].setAsHexString('0xff'); // ff

const proc = ref<Processor>(new Processor(mem));

function executeNextInstruction() {
    proc.value.processInstruction();
}

// TODO: create mem view as table of inputs instead of paragraph to allow changing values on the fly

function numToHex(value: number) {
    return value.toString(16).toUpperCase().padStart(4, '0');
}

const memView = computed(() => {
    const memView: string[] = [];
    proc.value.mem.forEach((element, index) => {
        if (proc.value.pc.getInt() === index) memView.push('<b>');
        memView.push(element.getAsHexString().substring(2, 4).toUpperCase());
        if (proc.value.pc.getInt() === index) memView.push('</b>');
        if ((index + 1) % 16 === 0) {
            memView.push(` | ${numToHex(index - 15)}-${numToHex(index)}<br/>`);
        }
        if ((index + 1) % 256 === 0) {
            memView.push('-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- | --------- <br/>');
        }
    });
    return memView.join(' ');
});

const opcode = computed(() => {
    return proc.value.mem[proc.value.pc.getInt()].getAsHexString().substring(2, 4).toUpperCase();
});

const assembly = computed(() => {
    return references.find(element => element.opc === opcode.value)?.assembly;
});

const operand = computed(() => {
    const instructions = references.filter(element => element.opc === opcode.value);
    let operand = '';
    instructions.forEach(element => {
        for (let i = 1; i < element.bytes; i++) {
            operand = operand.concat(` ${proc.value.mem[proc.value.pc.getInt() + i].getAsHexString().substring(2, 4).toUpperCase()}`);
        }
    });
    return operand;
});
</script>

<template>
    <h1>65-o-fun</h1>
    <h2>Registers</h2>
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
                <td class="registers">{{ proc.a.getAsHexString().substring(2, 4).toUpperCase() }}</td>
                <td class="registers">{{ proc.x.getAsHexString().substring(2, 4).toUpperCase() }}</td>
                <td class="registers">{{ proc.y.getAsHexString().substring(2, 4).toUpperCase() }}</td>
                <td class="registers">{{ proc.s.getAsHexString().substring(2, 4).toUpperCase() }}</td>
                <td class="registers">{{ proc.p.getAsHexString().substring(2, 4).toUpperCase() }}</td>
                <td class="pc">
                    {{ proc.pc.lowByte.getAsHexString().substring(2, 4).toUpperCase() }}
                    {{ proc.pc.highByte.getAsHexString().substring(2, 4).toUpperCase() }}
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
    <p class="monospaced" v-html="memView"></p>
</template>

<style>
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
