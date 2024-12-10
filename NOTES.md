# Notes

## Goal

Simulation of a 6502 based microcomputer but the modern and easy way:

-   Written in Typescript
-   Interaction via Vite/Vue/Node based webfrontend
-   Should contain all opcodes the 6502 has and perhaps more like the 65C02 and others from the 6502 family.
-   Easy interaction with a graphic card, sound card, input devices (keyboard, mouse, gamepad, joystick) etc.
-   Easy way to load external programs
-   Banked RAM allowing to use more then 64K of RAM
-   Dedicated video RAM
-   A modern BIOS with a linux like command line interface
-   No BASIC
-   BIOS written in Prog8?

## Features

-   All official 6502 opcodes
-   Decimal Mode
-   All illegal 6502 opcodes (not yet)
-   All 65C02 opcodes (not yet)
-   Memory view
-   Memory edit
-   Unit tests (partial)
-   Random Opcode Tests
-   Display with tile based output (8x8 tiles in black and white)
-   More display modes (not yet)
-   Keyboard input
-   RAM banking (not yet)

## Current Todos

-   Add manual breakpoint in debug view
-   rename vars: sInt8, uInt8
-   add mouseover with address for memory cells
-   increase performance \*\*\*
-   Write Keyboard Bios Routine (separate Repository)
-   Test all commands successfully (https://github.com/SingleStepTests/65x02)
    -   Test Command Speed for Statistics
-   Allow editing processor registers
-   Reset (Registers, Memory, Screen, Statistics, and all together)
-   Add keyboard input buffer
-   Use setters and getters (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects#defining_getters_and_setters)
-   Use Proxy to detect mem changes (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
-   devide into separate components; Create a separate module for computer and the depending classes, that are not UI dependent

## Things you need to know about the 65-o-fun

-   Default display resolution 320x240 (scale factor 2 in browser)
-   Text color white, Background Color black
-   All ASCII characters (uppercase and lowercase)
-   Screen memory starts at $0400 (will be changed later)
-   As usual: Zero Page 00-FF, Stack 0100-01FF
-   Page 3 should contain IO interaction to access keyboard, storage devices etc.
-   Keyboard 10 Bytes ($0200-$0209)
    -   Byte 0: ABCDEFGH
    -   Byte 1: IJKLMNOP
    -   Byte 2: QRSTUVWX
    -   Byte 3: YZ123456
    -   Byte 4: 7890 + [MINUS, EQUAL, COMMA, PERIOD]
    -   Byte 5: [SHIFT, CTRL, ALT, META, TAB, CAPS LOCK, SPACE, SLASH]
    -   Byte 6: [LEFT, RIGHT, UP, DOWN, ENTER, BACKSPACE, ESC, BACKSLASH]
    -   Byte 7: [F1, F2, F3, F4, F5, F6, F7, F8]
    -   Byte 8: [F9, F10, SEMICOLON, QUOTE, BRACKET LEFT, BRACKET RIGHT, BACK QUOTE, INTL BACKSLASH]
    -   Byte 9: [PAGE UP, PAGE DOWN, HOME, END, INSERT, DELETE, PRINT, XXX]

## Performance

accessing full 64K of mem

### class based mem (current)

write (setInt) 320-380 millisec
read (getInt) 40-45 millisec

### array only

write to Array 0.4 - 0.6 millisec
read from Array 0.4 - 0.5 millisec

### array in class

write to Array 51 - 55 millisec
read from Array 19 - 21 millisec

=======================================================================================

addByteToAccumulatorOld(value: Byte) {
let carry;
let overflow;
let negative;

        if (this.p.getDecimalFlag()) {
            /*
            Reference: http://www.6502.org/tutorials/decimal_mode.html#A

            6502
            ----
            Seq. 1 => A, C
            Seq. 2 => N, V
            Z binary

            Seq. 1:

            1a. AL = (A & $0F) + (B & $0F) + C
            1b. If AL >= $0A, then AL = ((AL + $06) & $0F) + $10
            1c. A = (A & $F0) + (B & $F0) + AL
            1d. Note that A can be >= $100 at this point
            1e. If (A >= $A0), then A = A + $60
            1f. The accumulator result is the lower 8 bits of A
            1g. The carry result is 1 if A >= $100, and is 0 if A < $100
            */

            let temp1;
            let temp2;
            let a1;
            let a2;
            const a = this.a.getInt();
            const b = value.getInt();
            const c = this.p.getCarryFlag() ? 1 : 0;

            temp1 = (a & 0x0f) + (b & 0x0f) + c; // 1a
            if (temp1 >= 0x0a) temp1 = ((temp1 + 0x06) & 0x0f) + 0x10; // 1b

            a1 = (a & 0xf0) + (b & 0xf0) + temp1; // 1c
            if (a1 >= 0xa0) a1 = a1 + 0x60; // 1e

            this.a.setInt(a1 % 256); // 1f
            carry = a1 >= 0x100 ? true : false; // 1g

            /*
            Seq. 2:

            2a. AL = (A & $0F) + (B & $0F) + C
            2b. If AL >= $0A, then AL = ((AL + $06) & $0F) + $10
            2c. A = (A & $F0) + (B & $F0) + AL, using signed (twos complement) arithmetic
            2e. The N flag result is 1 if bit 7 of A is 1, and is 0 if bit 7 if A is 0
            2f. The V flag result is 1 if A < -128 or A > 127, and is 0 if -128 <= A <= 127
            */

            const aSigned = a > 127 ? a - 256 : a;
            const bSigned = b > 127 ? b - 256 : b;

            temp2 = (aSigned & 0x0f) + (bSigned & 0x0f) + c; // 2a
            if (temp2 >= 0x0a) temp2 = ((temp2 + 0x06) & 0x0f) + 0x10; // 2b

            a2 = (aSigned & 0xf0) + (bSigned & 0xf0) + temp2; // 2c

            negative = a2 > 127 && a2 <= 255 ? true : false; // 2e
            overflow = a2 < -128 || a2 > 127 ? true : false; // 2f
        } else {
            const carryBit = this.p.getCarryFlag() ? 1 : 0;

            const result = this.a.getInt() + value.getInt() + carryBit;
            const resultSigned = this.a.getAsSignedInt() + value.getAsSignedInt() + carryBit;

            this.a.setInt(result % 256);

            carry = result > 255 ? true : false; // int overflow
            negative = (resultSigned < 0 && resultSigned >= -128) || resultSigned > 127 ? true : false;
            overflow = resultSigned < -128 || resultSigned > 127 ? true : false; // signed int overflow
        }

        const zero = this.a.getInt() === 0 ? true : false;

        return { carry, overflow, negative, zero };
    }
