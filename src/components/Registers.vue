<script setup lang="ts">
import { Computer } from '../logic/Computer';

const comp = defineModel<Computer>({ required: true });

function onFlagInputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;

    target.value = (parseInt(target.value) === 0 || parseInt(target.value) === 1 ? target.value : 0).toString();
    if (target.value === 'NAN') target.value = '0';

    const flagN = document.getElementById('N') as HTMLInputElement;
    const flagV = document.getElementById('V') as HTMLInputElement;
    const flag1 = document.getElementById('1') as HTMLInputElement;
    const flagB = document.getElementById('B') as HTMLInputElement;
    const flagD = document.getElementById('D') as HTMLInputElement;
    const flagI = document.getElementById('I') as HTMLInputElement;
    const flagZ = document.getElementById('Z') as HTMLInputElement;
    const flagC = document.getElementById('C') as HTMLInputElement;

    const pAsBitString = `${flagN.value}${flagV.value}${flag1.value}${flagB.value}${flagD.value}${flagI.value}${flagZ.value}${flagC.value}`;
    comp.value.cpu.p.setAsBitString(pAsBitString);
    comp.value.cpu.p.initRegister();
}

function onRegInputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;

    if (target && target.dataset.register === 'PC') {
        target.value = (parseInt(target.value, 16) % 65536).toString(16).toUpperCase().padStart(4, '0');
        if (target.value === '0NAN') target.value = '0000';
    } else {
        target.value = (parseInt(target.value, 16) % 256).toString(16).toUpperCase().padStart(2, '0');
        if (target.value === 'NAN') target.value = '00';
    }

    if (target) {
        switch (target.dataset.register) {
            case 'A':
                comp.value.cpu.a.setAsHexString(target.value);
                break;
            case 'X':
                comp.value.cpu.x.setAsHexString(target.value);
                break;
            case 'Y':
                comp.value.cpu.y.setAsHexString(target.value);
                break;
            case 'S':
                comp.value.cpu.s.setAsHexString(target.value);
                break;
            case 'P':
                comp.value.cpu.p.setAsHexString(target.value);
                comp.value.cpu.p.initRegister();
                break;
            case 'PC':
                comp.value.cpu.pc.setAsHexString(target.value.substring(2, 4), target.value.substring(0, 2));
                break;
            default:
                break;
        }
    }
}
</script>

<template>
    <div id="registers">
        <table>
            <tbody>
                <tr>
                    <th>A</th>
                    <th>X</th>
                    <th>Y</th>
                    <th>S</th>
                    <th>P</th>
                    <th>PC (Lo Hi)</th>
                </tr>
                <tr>
                    <td class="registers">
                        <input
                            class="registerInput"
                            type="text"
                            @change="onRegInputChanged($event)"
                            maxlength="2"
                            :data-register="'A'"
                            :value="comp.cpu.a.getAsHexString()"
                        />
                    </td>
                    <td class="registers">
                        <input
                            class="registerInput"
                            type="text"
                            @change="onRegInputChanged($event)"
                            maxlength="2"
                            :data-register="'X'"
                            :value="comp.cpu.x.getAsHexString()"
                        />
                    </td>
                    <td class="registers">
                        <input
                            class="registerInput"
                            type="text"
                            @change="onRegInputChanged($event)"
                            maxlength="2"
                            :data-register="'Y'"
                            :value="comp.cpu.y.getAsHexString()"
                        />
                    </td>
                    <td class="registers">
                        <input
                            class="registerInput"
                            type="text"
                            @change="onRegInputChanged($event)"
                            maxlength="2"
                            :data-register="'S'"
                            :value="comp.cpu.s.getAsHexString()"
                        />
                    </td>
                    <td class="registers">
                        <input
                            class="registerInput"
                            type="text"
                            @change="onRegInputChanged($event)"
                            maxlength="2"
                            :data-register="'P'"
                            :value="comp.cpu.p.getAsHexString()"
                        />
                    </td>
                    <td class="pc">
                        <input
                            class="registerInput"
                            style="width: 2rem"
                            type="text"
                            @change="onRegInputChanged($event)"
                            maxlength="4"
                            :data-register="'PC'"
                            :value="comp.cpu.pc.int.toString(16).toUpperCase().padStart(4, '0')"
                        />
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
                    <td class="flags">
                        <input
                            id="N"
                            class="flagInput"
                            type="text"
                            @change="onFlagInputChanged($event)"
                            maxlength="1"
                            :value="comp.cpu.p.getNegativeFlag() ? '1' : '0'"
                        />
                    </td>
                    <td class="flags">
                        <input
                            id="V"
                            class="flagInput"
                            type="text"
                            @change="onFlagInputChanged($event)"
                            maxlength="1"
                            :value="comp.cpu.p.getOverflowFlag() ? '1' : '0'"
                        />
                    </td>
                    <td class="flags">
                        <input
                            id="1"
                            class="flagInput"
                            type="text"
                            @change="onFlagInputChanged($event)"
                            maxlength="1"
                            :value="comp.cpu.p.getExpansionBit() ? '1' : '0'"
                        />
                    </td>
                    <td class="flags">
                        <input
                            id="B"
                            class="flagInput"
                            type="text"
                            @change="onFlagInputChanged($event)"
                            maxlength="1"
                            :value="comp.cpu.p.getBreakFlag() ? '1' : '0'"
                        />
                    </td>
                    <td class="flags">
                        <input
                            id="D"
                            class="flagInput"
                            type="text"
                            @change="onFlagInputChanged($event)"
                            maxlength="1"
                            :value="comp.cpu.p.getDecimalFlag() ? '1' : '0'"
                        />
                    </td>
                    <td class="flags">
                        <input
                            id="I"
                            class="flagInput"
                            type="text"
                            @change="onFlagInputChanged($event)"
                            maxlength="1"
                            :value="comp.cpu.p.getInterruptFlag() ? '1' : '0'"
                        />
                    </td>
                    <td class="flags">
                        <input
                            id="Z"
                            class="flagInput"
                            type="text"
                            @change="onFlagInputChanged($event)"
                            maxlength="1"
                            :value="comp.cpu.p.getZeroFlag() ? '1' : '0'"
                        />
                    </td>
                    <td class="flags">
                        <input
                            id="C"
                            class="flagInput"
                            type="text"
                            @change="onFlagInputChanged($event)"
                            maxlength="1"
                            :value="comp.cpu.p.getCarryFlag() ? '1' : '0'"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
#registers {
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 20px;
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

.flags {
    min-width: 1rem;
}

.registers {
    min-width: 2rem;
}

.pc {
    min-width: 4rem;
}

.flagInput {
    width: 0.5rem;
    border-style: none;
}

.registerInput {
    width: 1rem;
    border-style: none;
}
</style>
