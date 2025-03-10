<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Computer } from '../logic/Computer';

const comp = defineModel<Computer>('computer', { required: true });

const memPageIndex = defineModel<number>('memPageIndex', { required: true });
const memPageIndexHex = defineModel<string>('memPageIndexHex', { required: true });

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);

const uploadDataDisabled = ref(true);

const loadAddress = ref('0000');

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
        loadAddress.value = '0000';
    }
}

function importBinData(value: Uint8Array) {
    comp.value.cpu.pc.setAsHexString(loadAddress.value.substring(2, 4), loadAddress.value.substring(0, 2));
    // value comes in chunks of 65536
    value.forEach((element, index) => {
        comp.value.mem.setInt(comp.value.cpu.pc.int[0] + index, element);
    });
}

function importPrgData(value: Uint8Array) {
    comp.value.cpu.pc.setInt(value[0], value[1]);
    // value comes in chunks of 65536
    value.forEach((element, index) => {
        if (index <= 1) return; // skip first two bytes
        const offset = -2; // offset -2 to compensate for 1st two bytes
        comp.value.mem.setInt(comp.value.cpu.pc.int[0] + index + offset, element);
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

function onHex2InputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;

    if (target) {
        target.value = (parseInt(target.value, 16) % 256).toString(16).toUpperCase().padStart(2, '0');
        if (target.value === 'NAN') target.value = '00';
    }
}

function onHex4InputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;

    if (target) {
        target.value = (parseInt(target.value, 16) % 65536).toString(16).toUpperCase().padStart(4, '0');
        if (target.value === '0NAN') target.value = '0000';
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

function clearMemory() {
    comp.value.mem.reset();
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

function memCellBackgroundColor(index: number) {
    const memOffset = index + memPageIndex.value * 256;
    if (memOffset === comp.value.cpu.pc.int[0]) {
        return 'red';
    } else if (comp.value.breakPoints.includes(memOffset)) {
        return 'blue';
    }
    return 'white';
}

function memCellTextColor(index: number) {
    const memOffset = index + memPageIndex.value * 256;
    if (memOffset === comp.value.cpu.pc.int[0]) {
        return 'white';
    } else if (comp.value.breakPoints.includes(memOffset)) {
        return 'white';
    }
    return 'black';
}

function getMemRowAsString(memPage: string[], index: number) {
    let row: string = '';

    for (let i = 15; i >= 0; i--) {
        const charCode = parseInt(memPage[index - i], 16);
        if (charCode >= 0x20 && charCode <= 0x7e) {
            row = row.concat(String.fromCharCode(charCode));
        } else {
            row = row.concat('☒');
        }
    }

    return row.split('');
}
</script>

<template>
    <div class="memory">
        <div class="memoryOptions">
            <div style="display: flex; gap: 10px">
                <button type="button" @click="clearMemory()">Clear Memory</button>
                <button type="button" @click="uploadData()" :disabled="uploadDataDisabled">Upload</button>
                <input type="file" @change="onFileChanged($event)" accept=".bin,.prg" ref="fileSelector" />
            </div>
            <div style="display: flex; gap: 10px">
                <span>Memory address of *.bin file loaded at</span>
                <input
                    class="hexInput"
                    style="width: 2rem"
                    type="text"
                    @change="onHex4InputChanged($event)"
                    maxlength="4"
                    :disabled="uploadDataDisabled"
                    v-model="loadAddress"
                />
            </div>
            <div>
                <span>Memory address of *.prg files is auto-located</span>
            </div>
            <div style="display: flex; gap: 10px">
                <button type="button" @click="decreaseMemPageIndex()">Prev</button>
                <button type="button" @click="increaseMemPageIndex()">Next</button>
                <span>Memory Page</span>
                <input class="hexInput memPage" type="text" @change="onHex2InputChanged($event)" v-model="memPageIndexHex" />
                <button type="button" @click="setMemPageIndexToPcPage()">Goto PC</button>
            </div>
        </div>
        <div class="memView">
            <div class="memViewItem" v-for="(value, index) in memPage">
                <span v-if="index % 16 === 0">
                    | {{ addressToHex(index + memPageIndex * 256) }}-{{ addressToHex(index + 15 + memPageIndex * 256) }} |
                </span>
                <input
                    :style="{
                        backgroundColor: memCellBackgroundColor(index),
                        color: memCellTextColor(index)
                    }"
                    class="hexInput"
                    type="text"
                    :id="(index + memPageIndex * 256).toString(16)"
                    :title="`0x${(index + memPageIndex * 256).toString(16).toUpperCase().padStart(4, '0')}`"
                    @change="onMemInputChanged($event)"
                    maxlength="2"
                    :data-index="index"
                    :value="value"
                />
                <span v-if="(index + 1) % 16 === 0">
                    |
                    <span class="memString" v-for="value2 in getMemRowAsString(memPage, index)"> {{ value2 }}</span> |
                </span>
                <br v-if="(index + 1) % 16 === 0" />
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

.memString {
    display: inline-block;
    width: 0.8rem;
    text-align: center;
}
</style>
