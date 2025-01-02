/*
    Reads an fnt XML file and the corresponding image files in 
    Truevision TGA Format and stores all glyphs as described in Codepage437
    as an Kick Assembler file that is useable within the 65-o-fun project.

    Information about the glyph location is stored in an XML file.
    https://www.angelcode.com/products/bmfont/doc/file_format.html

    Both are exported with the Bitmap Font Generator:
    https://www.angelcode.com/products/bmfont/

    See reference: https://en.wikipedia.org/wiki/Truevision_TGA
*/

import { readFileSync, writeFileSync } from 'node:fs';
import xmlToJson from 'xml-to-json-stream';
import { codepage437ToUnicode } from './codepage437ToUnicode';
import { BitmapFontGeneratorFont, Page, Pages, SinglePage } from './BitmapFontGeneratorFont';

if (process.argv.length > 3) {
    console.log('too many arguments');
    process.exit();
}
if (process.argv.length < 3) {
    console.log('too few arguments');
    process.exit();
}

const argument = process.argv[2]; // first argument

const parser = xmlToJson({ attributeMode: true });

const baseName = argument.split('.fnt')[0];
const fntFileName = argument;

const fntFile = readFileSync(`./font-converter/fnt2asm/files/${fntFileName}`, 'binary');

const dummyChar = ['00000000', '00000000', '00000000', '00000000', '00000000', '00000000', '00000000', '00000000'];

parser.xmlToJson(fntFile, (err, json: BitmapFontGeneratorFont) => {
    if (err) {
        console.log(err);
    }

    let count = 0;

    let bitmapFont: string[][] = [];

    let missingChars: string[] = [];

    codepage437ToUnicode.forEach(value => {
        const codepage437Code = value[0] as number;
        const codepage437Unicode = value[2] as number;

        const char = json.font.chars.char.find(char => parseInt(char.id) === codepage437Unicode);
        if (char) {
            //console.log(`${codepage437Code} === ${codepage437Unicode}`);
            count++;

            let page: Page | undefined;

            if (typeof (json.font.pages as Pages).page.find === 'function') {
                page = (json.font.pages as Pages).page.find(page => page.id === char.page);
            } else {
                page = (json.font.pages as SinglePage).page;
            }

            if (page) {
                const content = readFileSync(`./font-converter/fnt2asm/files/${page.file}`, 'binary');

                const imageIDLength = content[0].charCodeAt(0);
                const colorMapType = content[1].charCodeAt(0);
                const imageType = content[2].charCodeAt(0);

                //console.log(`imageIDLength: ${imageIDLength} colorMapType: ${colorMapType} imageType: ${imageType}`);

                const firstEntryIndex = content[3].charCodeAt(0) | (content[4].charCodeAt(0) << 8);
                const colorMapLength = content[5].charCodeAt(0) | (content[6].charCodeAt(0) << 8);
                const colorMapEntrySize = content[7].charCodeAt(0);

                //console.log(`firstEntryIndex: ${firstEntryIndex} colorMapLength: ${colorMapLength} colorMapEntrySize: ${colorMapEntrySize}`);

                const xOrigin = content[8].charCodeAt(0) | (content[9].charCodeAt(0) << 8);
                const yOrigin = content[10].charCodeAt(0) | (content[11].charCodeAt(0) << 8);

                //console.log(`xOrigin: ${xOrigin} yOrigin: ${yOrigin}`);

                const imageWidth = content[12].charCodeAt(0) | (content[13].charCodeAt(0) << 8);
                const imageHeight = content[14].charCodeAt(0) | (content[15].charCodeAt(0) << 8);
                const pixelDepth = content[16].charCodeAt(0);

                //console.log(`imageWidth: ${imageWidth} imageHeight: ${imageHeight} pixelDepth: ${pixelDepth}`);

                const alphaChannelDepth = content[17].charCodeAt(0) & 0x00000111;
                const pixelOrderingV = (content[17].charCodeAt(0) & 0x00001000) === 0x00001000 ? 'right-to-left' : 'left-to-right';
                const pixelOrderingH = (content[17].charCodeAt(0) & 0x00010000) === 0x00010000 ? 'top-to-bottom' : 'bottom-to-top';

                //console.log(`alphaChannelDepth: ${alphaChannelDepth} pixelOrderingV: ${pixelOrderingV} pixelOrderingH: ${pixelOrderingH}`);

                const bitmapChar = getChar(parseInt(char.x), parseInt(char.y));
                bitmapFont.push(bitmapChar);
                console.log(bitmapChar);

                function getChar(charPosX: number, charPosY: number) {
                    const char: string[] = [];

                    for (let y = 0 + charPosY * 256; y < 8 * 256 + charPosY * 256; y = y + 256) {
                        let row = '';

                        for (let x = 0 + charPosX; x < 8 + charPosX; x++) {
                            row = row.concat(content[18 + x + y].charCodeAt(0) === 0 ? '0' : '1');
                        }

                        char.push(row);
                    }

                    return char;
                }
            }
        } else {
            bitmapFont.push(dummyChar);
            missingChars.push(codepage437Code.toString(16).toUpperCase().padStart(2, '0'));
        }
    });

    let asmContent = '';
    asmContent = asmContent.concat(`// Font: ${baseName}\n`);
    asmContent = asmContent.concat(`// Found ${count}/${codepage437ToUnicode.length} codepage437 chars\n`);
    asmContent = asmContent.concat(`// Missing: ${missingChars.join(', ')}\n`);
    asmContent = asmContent.concat(`// bitmapFont Length incl. dummy chars ${bitmapFont.length}\n`);

    bitmapFont.forEach((bitmapChar, index) => {
        asmContent = asmContent.concat(`\n//${index.toString(16).toUpperCase().padStart(2, '0')}\n`);
        bitmapChar.forEach(bitmapLine => {
            asmContent = asmContent.concat(`.byte %${bitmapLine}\n`);
        });
    });

    writeFileSync(`./font-converter/fnt2asm/files/${baseName}.asm`, asmContent, 'binary');
});
