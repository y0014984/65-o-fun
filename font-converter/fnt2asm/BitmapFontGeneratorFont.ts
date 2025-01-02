export class BitmapFontGeneratorFont {
    font: Font;
}

export class Font {
    info: Info;
    common: Common;
    pages: Pages | SinglePage;
    chars: Chars;
}

export class Info {
    face: string;
    size: string;
    bold: string;
    italic: string;
    charset: string;
    unicode: string;
    stretchH: string;
    smooth: string;
    aa: string;
    padding: string;
    spacing: string;
    outline: string;
}

export class Common {
    lineHeight: string;
    base: string;
    scaleW: string;
    scaleH: string;
    pages: string;
    packed: string;
    alphaChnl: string;
    redChnl: string;
    greenChnl: string;
    blueChnl: string;
}

export class Pages {
    page: Page[];
}

export class SinglePage {
    page: Page;
}

export class Page {
    id: string;
    file: string;
}

export class Chars {
    count: string;
    char: Char[];
}

export class Char {
    id: string;
    x: string;
    y: string;
    width: string;
    height: string;
    xOffset: string;
    yOffset: string;
    xadvance: string;
    page: string;
    chnl: string;
}
