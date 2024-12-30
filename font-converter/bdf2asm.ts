/*
    Reads a font file in Glyph Bitmap Distribution Format and stores all glyphs
    as an Kick Assembler file that is useable within the 65-o-fun project.

    See reference: https://en.wikipedia.org/wiki/Glyph_Bitmap_Distribution_Format
*/

import { readFileSync, writeFileSync } from 'node:fs';

const fontName = 'Bm437CompaqThin8x8-8';

const content = readFileSync(`./font-converter/${fontName}.bdf`, 'binary');

let newContent = '';

const lines = content.split(String.fromCharCode(0x0d) + String.fromCharCode(0x0a));

newContent = newContent.concat(`// Font: ${fontName}\n\n`);

lines.forEach((value, index, array) => {
    if (value.substring(0, 9) === 'STARTCHAR') {
        const regExEncoding = new RegExp('^ENCODING ([0-9]+)$');
        const asciiCode = parseInt(array[index + 1].match(regExEncoding)![1]);

        console.log(`// $${asciiCode.toString(16).toUpperCase().padStart(2, '0')}`);
        newContent = newContent.concat(`//${asciiCode.toString(16).toUpperCase().padStart(2, '0')}\n`);

        const regExBoundingBox = new RegExp('^BBX ([0-9]) ([0-9]) (-?[0-9]) (-?[0-9])$');
        const boundingBoxWidth = parseInt(array[index + 4].match(regExBoundingBox)![1]);
        const boundingBoxHeight = parseInt(array[index + 4].match(regExBoundingBox)![2]);
        const boundingBoxOffsetX = parseInt(array[index + 4].match(regExBoundingBox)![3]);
        const boundingBoxOffsetY = parseInt(array[index + 4].match(regExBoundingBox)![4]);

        //console.log(`Bounding Box -> W: ${boundingBoxWidth} H: ${boundingBoxHeight} OX: ${boundingBoxOffsetX} OY: ${boundingBoxOffsetY}`);

        const bitStringArray: string[] = [];

        // prepend empty lines (count = negative offsetY) if less then 8 lines
        if (boundingBoxOffsetY <= 0 && boundingBoxHeight < 8) {
            for (var offsetY = 0; offsetY < -boundingBoxOffsetY; offsetY++) {
                bitStringArray.push('%00000000');
            }
        }

        // add lines with data
        for (var i = 0; i < boundingBoxHeight; i++) {
            const number = parseInt(array[index + 6 + i], 16)
                .toString(2)
                .padStart(8, '0');
            bitStringArray.push(`%${number.padStart(number.length + boundingBoxOffsetX, '0').substring(0, 8)}`);
        }

        // append empty lines (count = offsetY) and baseline if less then 8 lines
        if (boundingBoxOffsetY >= 0 && boundingBoxHeight < 8) {
            for (var offsetY = 0; offsetY < boundingBoxOffsetY; offsetY++) {
                bitStringArray.push('%00000000');
            }
            // baseline
            bitStringArray.push('%00000000');
        }

        // prepend empty lines if less then 8 lines
        const max = 8 - bitStringArray.length;
        for (var i = 0; i < max; i++) {
            bitStringArray.unshift('%00000000');
        }

        // output
        for (var i = 0; i < 8; i++) {
            console.log(`.byte ${bitStringArray[i]}`);
            newContent = newContent.concat(`.byte ${bitStringArray[i]}\n`);
        }

        console.log();
        newContent = newContent.concat(`\n`);
    }
});

writeFileSync(`./font-converter/${fontName}.asm`, newContent, 'binary');
