# 65-o-fun

## Introduction

6502 home computer simulator with direct manipulation of memory and registers. Supports screen output and keyboard input.

## Goal

-   Written in Typescript
-   Interaction via Vite/Vue/Node based webfrontend
-   Should contain all legal and illegal 6502 opcodes
-   Should support other CPUs from the 6502 familiy like the 65C02
-   Easy interaction with a graphics, sounds, input devices (keyboard, mouse, gamepad, joystick) etc.
-   Easy way to load external programs
-   Banked RAM allowing to use more then 64K of RAM
-   Dedicated video RAM
-   A modern BIOS with a linux like command line interface (separate [Repository](https://github.com/y0014984/65-o-fun-bios))

## Features

-   All official 6502 opcodes
-   Decimal Mode
-   All illegal 6502 opcodes (not yet)
-   All 65C02 opcodes (not yet)
-   Memory/Register view
-   Memory/Register edit
-   Single Step Execution
-   Unit tests (partial)
-   Random Opcode Tests
-   Keyboard input
-   Display with tile based output (8x8 tiles in black and white) 320x240px = 40x30 tiles
-   software and time-based hardware interrupts
-   manual breakpoints
-   More display modes (not yet)
-   RAM banking (not yet)
-   Linux like Bios supporting the following commands:
    -   echo

## Build

Clone/copy the repository. Install node/npm. Then install the necessary modules with:

```
npm install
```

Run the project in dev mode with:

```
npm run dev
```

Build the project with the following command:

```
npm run build
```

Run tests with (temporarily broken):

```
npm run test
```

or with (temporarily broken):

```
npm run singleStepTests
```

or with (temporarily broken):

```
npm run testProg
```
