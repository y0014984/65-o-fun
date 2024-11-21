<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';

import Byte from './logic/Byte.ts';
import Processor from './logic/Processor.ts';

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

const proc = new Processor(mem);

for (let i = 0; i < 1024; i++) {
    proc.processInstruction();
}

console.log(mem[255].getAsNumber()); // 42 + 10 - 10
</script>

<template>
    <div>
        <a href="https://vite.dev" target="_blank">
            <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <a href="https://vuejs.org/" target="_blank">
            <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
        </a>
    </div>
    <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
