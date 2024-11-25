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
-   BIOS written in Prog8

## Current Todos

-   6502 Opcodes Implementation
    -   Unit Tests
    -   Change ADC, SBC etc. to use binary functions
-   Decimal Mode Command Variations
    -   ADC
    -   SBC
    -   INC
    -   DEC
    -   and all others that affect calculation
-   Use setters and getters (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects#defining_getters_and_setters)
-   Use Proxy to detect mem changes (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
-   Create a separate module for computer and the depending classes, that are not UI dependent
