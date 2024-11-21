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

-   Webfrontend
-   6502 Opcodes Implementation
    -   Unit Tests
    -   Change ADC, SBC etc. to use binary functions
    -   setArithmeticFlags in new Class ArithmeticRegister
-   final check
    -   OPCODES
    -   Count

### Todo Opcodes

-   Interrupt Commands
    -   BRK
    -   RTI
-   Logical/Bit Commands
    -   ASL
    -   LSR
    -   ROL
    -   ROR
-   Decimal Mode Commands
    -   ADC
    -   SBC
    -   INC
    -   DEC
    -   and all others that affect calculation
