# Notes

## Things you need to know about the 65-o-fun

-   Default display resolution 320x240 (scale factor 2 in browser)
-   Text color white, Background Color black
-   All ASCII characters (uppercase and lowercase) $20-$7E
-   Characters use 8x8 tiles which is 40x30 tiles
-   Screen memory starts at $0400 (will be changed later)
-   Hardware interrupt with keyscan every 1_000_000/60 cycles (60 times a second if cpu runs at 1 MHz)
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
