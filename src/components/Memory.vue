<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Computer } from '../logic/Computer';

const comp = defineModel<Computer>({ required: true });

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);

const uploadDataDisabled = ref(true);

const loadAddressLowByte = ref('00');
const loadAddressHighByte = ref('00');

const memPageIndex = ref(0);
const memPageIndexHex = ref('00');

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
        loadAddressHighByte.value = '00';
        loadAddressLowByte.value = '00';
    }
}

function importBinData(value: Uint8Array) {
    comp.value.cpu.pc.setAsHexString(loadAddressLowByte.value, loadAddressHighByte.value);
    // value comes in chunks of 65536
    value.forEach((element, index) => {
        comp.value.mem.setInt(comp.value.cpu.pc.int + index, element);
    });
}

function importPrgData(value: Uint8Array) {
    comp.value.cpu.pc.setInt(value[0], value[1]);
    // value comes in chunks of 65536
    value.forEach((element, index) => {
        if (index <= 1) return; // skip first two bytes
        const offset = -2; // offset -2 to compensate for 1st two bytes
        comp.value.mem.setInt(comp.value.cpu.pc.int + index + offset, element);
    });
}

function onFileChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        file.value = target.files[0];
    }

    uploadDataDisabled.value = target.value === '' ? true : false;
}

function onMemInputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;

    if (target) {
        target.value = (parseInt(target.value, 16) % 256).toString(16).toUpperCase().padStart(2, '0');
        if (target.value === 'NAN') target.value = '00';
    }

    if (target) {
        const memIndex = parseInt(target.dataset.index || '0') + memPageIndex.value * 256;
        comp.value.mem.setAsHexString(memIndex, target.value);
    }
}

function onHexInputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;

    if (target) {
        target.value = (parseInt(target.value, 16) % 256).toString(16).toUpperCase().padStart(2, '0');
        if (target.value === 'NAN') target.value = '00';
    }
}

function addressToHex(value: number) {
    return value.toString(16).toUpperCase().padStart(4, '0');
}

function increaseMemPageIndex() {
    if (memPageIndex.value < 255) memPageIndex.value++;
}

function decreaseMemPageIndex() {
    if (memPageIndex.value > 0) memPageIndex.value--;
}

function setMemPageIndexToPcPage() {
    memPageIndex.value = comp.value.cpu.pc.getHighByte();
}

const memPage = computed(() => {
    const tmpMemPage: string[] = [];

    comp.value.mem.int.forEach((element, index) => {
        const indexFirstElement = memPageIndex.value * 256;
        const indexLastElement = memPageIndex.value * 256 + 255;
        if (index >= indexFirstElement && index <= indexLastElement) tmpMemPage.push(element.toString(16).toUpperCase().padStart(2, '0'));
    });

    return tmpMemPage;
});

watch(memPageIndexHex, newHex => {
    memPageIndex.value = parseInt(newHex, 16);
});

watch(memPageIndex, newIndex => {
    memPageIndexHex.value = newIndex.toString(16).toUpperCase().padStart(2, '0');
    if (memPageIndexHex.value === 'NAN') memPageIndexHex.value = '00';
});
</script>

<template>
    <div class="memory">
        <div class="memoryOptions">
            <div style="display: flex; gap: 10px">
                <button type="button" @click="uploadData()" :disabled="uploadDataDisabled">Upload</button>
                <input type="file" @change="onFileChanged($event)" accept=".bin,.prg" ref="fileSelector" />
            </div>
            <div style="display: flex; gap: 10px">
                <span>Load *.bin file at memory address</span>
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
            <div style="display: flex; gap: 10px">
                <button type="button" @click="decreaseMemPageIndex()">Prev</button>
                <button type="button" @click="increaseMemPageIndex()">Next</button>
                <span>Memory Page</span>
                <input class="hexInput memPage" type="text" @change="onHexInputChanged($event)" v-model="memPageIndexHex" />
                <button type="button" @click="setMemPageIndexToPcPage()">Goto PC</button>
            </div>
        </div>
        <div class="memView">
            <div class="memViewItem" v-for="(value, index) in memPage">
                <input
                    :style="{
                        backgroundColor: index + memPageIndex * 256 === comp.cpu.pc.int ? 'red' : 'white',
                        color: index + memPageIndex * 256 === comp.cpu.pc.int ? 'white' : 'black'
                    }"
                    class="hexInput"
                    type="text"
                    :title="`0x${(index + memPageIndex * 256).toString(16).toUpperCase().padStart(4, '0')}`"
                    @change="onMemInputChanged($event)"
                    maxlength="2"
                    :data-index="index"
                    :value="value"
                />
                <span v-if="(index + 1) % 16 === 0">
                    <span> | {{ addressToHex(index - 15 + memPageIndex * 256) }}-{{ addressToHex(index + memPageIndex * 256) }} </span>
                    <br />
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.memory {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 5px;
}

.memoryOptions {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 5px;
    justify-self: center;
}

.memView {
    justify-self: center;
}

.memViewItem {
    display: inline;
}

.hexInput {
    border-width: 1px;
    border-style: solid;
    width: 1rem;
}
</style>
