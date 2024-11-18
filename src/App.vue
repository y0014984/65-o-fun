<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';

import Byte8 from './logic/byte8.ts';
import Processor from './logic/processor.ts';

const mem: Byte8[] = [];
for (let i = 0; i < 256; i++) {
    mem.push(new Byte8());
}
mem[0].setAsHexString('0xa9'); // LDA IM
mem[1].setAsHexString('0x2a'); // 2A = 42
mem[2].setAsHexString('0x85'); // STA ZP
mem[3].setAsHexString('0xff'); // ff
mem[4].setAsHexString('0xe6'); // INC ZP
mem[5].setAsHexString('0xff'); // ff

const proc = new Processor(mem);

proc.processInstruction();
proc.processInstruction();
proc.processInstruction();

console.log(mem[255].getAsBitsString());
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
