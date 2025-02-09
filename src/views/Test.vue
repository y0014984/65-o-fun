<script setup lang="ts">
import { ref, computed } from 'vue';
import { Computer } from '../logic/Computer.ts';
import { Reference, references } from '../logic/Reference.ts';

interface Test {
    name: string;
    initial: {
        pc: number;
        s: number;
        a: number;
        x: number;
        y: number;
        p: number;
        ram: [number, number][];
    };
    final: {
        pc: number;
        s: number;
        a: number;
        x: number;
        y: number;
        p: number;
        ram: [number, number][];
    };
    cycles: [number, number, string][];
}

const output = ref('');

const outputHtml = computed(() => {
    return output.value.replace(/\n/g, '<br>');
});

const opCodeStart = ref('00');
const opCodeEnd = ref('FF');

function test() {
    references.forEach(async (reference: Reference) => {
        // Skip everything except Opcodes in this range
        if (
            !(
                parseInt(reference.opc, 16) >= parseInt(opCodeStart.value, 16) &&
                parseInt(reference.opc, 16) <= parseInt(opCodeEnd.value, 16)
            )
        )
            return;

        const jsonResponse = await fetch(
            `https://raw.githubusercontent.com/SingleStepTests/65x02/refs/heads/main/6502/v1/${reference.opc.toLowerCase()}.json`
        );
        const data = (await jsonResponse.json()) as Test[];

        //addLineToOutput(`${reference.opc}: ${reference.assembly} `);

        let testCount = 0;
        let errorCount = 0;
        let aErrorCount = 0;
        let overflowErrorCount = 0;
        let negativeErrorCount = 0;
        let carryErrorCount = 0;
        let zeroErrorCount = 0;

        let duration = 0;

        data.every((test, _index) => {
            const comp = new Computer({ monitorWidth: 320, monitorHeight: 240, testMode: true });

            //addLineToOutput(test.name);

            comp.cpu.pc.setInt(test.initial.pc & 0x00ff, (test.initial.pc & 0xff00) >> 8);
            comp.cpu.s.setInt(test.initial.s);
            comp.cpu.a.setInt(test.initial.a);
            comp.cpu.x.setInt(test.initial.x);
            comp.cpu.y.setInt(test.initial.y);
            comp.cpu.p.setInt(test.initial.p);

            //if (comp.cpu.p.getDecimalFlag()) addStrToOutput(' D ');

            test.initial.ram.forEach(ram => {
                comp.mem.setInt(ram[0], ram[1]);
            });

            const timeStart = performance.now();
            comp.cpu.processInstruction();
            const timeEnd = performance.now();
            duration += timeEnd - timeStart;

            let is = 0;
            let shouldBe = 0;

            is = comp.cpu.pc.int;
            shouldBe = test.final.pc;
            if (is !== shouldBe) {
                addLineToOutput(`PC mismatch => is: ${is} should be: ${shouldBe}`);
                errorCount++;
            }

            is = comp.cpu.s.int[0];
            shouldBe = test.final.s;
            if (is !== shouldBe) {
                addLineToOutput(`S mismatch => is: ${is} should be: ${shouldBe}`);
                errorCount++;
            }

            is = comp.cpu.a.int[0];
            shouldBe = test.final.a;
            if (is !== shouldBe) {
                addLineToOutput(`A mismatch => is: ${is} should be: ${shouldBe}`);
                errorCount++;
                aErrorCount++;
            }

            is = comp.cpu.x.int[0];
            shouldBe = test.final.x;
            if (is !== shouldBe) {
                addLineToOutput(`X mismatch => is: ${is} should be: ${shouldBe}`);
                errorCount++;
            }

            is = comp.cpu.y.int[0];
            shouldBe = test.final.y;
            if (is !== shouldBe) {
                addLineToOutput(`Y mismatch => is: ${is} should be: ${shouldBe}`);
                errorCount++;
            }

            is = comp.cpu.p.int[0];
            shouldBe = test.final.p;
            if (is !== shouldBe) {
                addLineToOutput(`P mismatch => is: ${is} should be: ${shouldBe}`);
                errorCount++;

                const overflowIs = (is & 0b01000000) === 0b01000000;
                const overflowShouldBe = (shouldBe & 0b01000000) === 0b01000000;
                if (overflowIs !== overflowShouldBe) overflowErrorCount++;

                const negativeIs = (is & 0b10000000) === 0b10000000;
                const negativeShouldBe = (shouldBe & 0b10000000) === 0b10000000;
                if (negativeIs !== negativeShouldBe) negativeErrorCount++;

                const carryIs = (is & 0b00000001) === 0b00000001;
                const carryShouldBe = (shouldBe & 0b00000001) === 0b00000001;
                if (carryIs !== carryShouldBe) carryErrorCount++;

                const zeroIs = (is & 0b00000010) === 0b00000010;
                const zeroShouldBe = (shouldBe & 0b00000010) === 0b00000010;
                if (zeroIs !== zeroShouldBe) zeroErrorCount++;
            }

            test.final.ram.forEach(ram => {
                is = comp.mem.int[ram[0]];
                shouldBe = ram[1];
                if (is !== shouldBe) {
                    addLineToOutput(`ram[${ram[0]}] mismatch => is: ${is})} should be: ${shouldBe}`);
                    errorCount++;
                }
            });

            testCount++;
            //if (testCount % 250 === 0) addStrToOutput('+');

            //return errorCount > 0 ? false : true;
            //return aErrorCount > 0 ? false : true;
            //return negativeErrorCount > 0 ? false : true;
            return true;
        });

        addLineToOutput(`${reference.opc}: ${reference.assembly} => tests: ${testCount} errors: ${errorCount}`);

        addLineToOutput(`A errors: ${aErrorCount}`);
        addLineToOutput(`overflow errors: ${overflowErrorCount}`);
        addLineToOutput(`negative errors: ${negativeErrorCount}`);
        addLineToOutput(`carry errors: ${carryErrorCount}`);
        addLineToOutput(`zero errors: ${zeroErrorCount}`);

        addLineToOutput(`avg. duration: ${((duration / testCount) * 1000).toFixed(1)} microseconds`);
    });
}

function addLineToOutput(line: string) {
    output.value += `${line}\n`;
}

/* function addStrToOutput(str: string) {
    output.value += str;
} */

function onHexInputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;

    target.value = (parseInt(target.value, 16) % 256).toString(16).toUpperCase().padStart(2, '0');
    if (target.value === 'NAN') target.value = '00';
}
</script>

<template>
    <div id="test">
        <div id="test-config">
            <span>Start</span>
            <input class="registerInput" type="text" @change="onHexInputChanged($event)" maxlength="2" v-model="opCodeStart" />
            <span>End</span>
            <input class="registerInput" type="text" @change="onHexInputChanged($event)" maxlength="2" v-model="opCodeEnd" />
            <button type="button" @click="test()">Test</button>
        </div>
        <p style="text-align: left" v-html="outputHtml"></p>
    </div>
</template>

<style>
#test {
    padding: 10px;
    border: solid;
    margin: 5px;

    display: grid;
    grid-template-columns: 1fr;
    row-gap: 10px;
    justify-items: stretch;
}

#test-config {
    display: flex;
    justify-self: center;
    justify-content: center;
    width: 640px;
    gap: 10px;
}

.registerInput {
    width: 1rem;
    border-style: 1px;
}
</style>
