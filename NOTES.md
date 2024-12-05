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
-   Decimal Mode (not yet)
-   All 65C02 opcodes (not yet)
-   Memory view
-   Memory edit
-   Unit tests (partial)
-   Display with tile based output (8x8 tiles in black and white)
-   More display modes (not yet)
-   Keyboard input
-   RAM banking (not yet)

## Current Todos

-   remove "setAddSubstractFlags" and incorporate in other functions
-   increase performance
-   Write Keyboard Bios Routine (separate Repository)
-   Test all commands successfully (https://github.com/SingleStepTests/65x02)
    -   Test Command Speed for Statistics
-   Default: load address for programm from 1st two bytes (if it's a \*.prg file)
-   Allow editing processor registers
-   Reset (Registers, Memory, Screen, Statistics, and all together)
-   Add keyboard input buffer
-   devide into separate components
-   6502 Opcodes Implementation
    -   Unit Tests
    -   Change ADC, SBC etc. to use binary functions
-   Decimal Mode Support
-   Use setters and getters (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects#defining_getters_and_setters)
-   Use Proxy to detect mem changes (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
-   Create a separate module for computer and the depending classes, that are not UI dependent

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
