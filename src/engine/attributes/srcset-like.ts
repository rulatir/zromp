import {ParsedAttribute} from "../parsed-attribute.ts";

import moo from "moo";

const lexer = moo.compile({
    WS: {match: /\s+/, lineBreaks: true},
    comma: ",",
    widthDescriptor: /[0-9]+w/,
    densityDescriptor: /(?:[0-9]+|\.[0-9]+|[0-9]+\.[0-9]+)(?:[eE][+-]?[0-9]+)?x/,
    url: /[^,\s]\S+[^,\s]/
});

export class SrcSetLike extends ParsedAttribute {

    private tokens: moo.Token[];
    private urls: moo.Token[];
    constructor(element: HTMLElement, attributeName: string, attributeValue: string) {
        super(element, attributeName, attributeValue);
        console.log(`Parsing "${attributeValue}"`);
        this.tokens = Array.from(lexer.reset(attributeValue));
        this.urls = this.tokens.filter(token => token.type === "url");
    }

    getURLs(): string[] {
        return this.urls.map(token => token.value);
    }

    replaceURL(index: number, newURL: string): void {
        if (index < 0 || index >= this.urls.length) {
            throw new Error("Out-of-bounds index of URL string within attribute value");
        }
        this.urls[index].value = newURL;
    }

    apply(): void {
        this.element.setAttribute(this.attributeName, this.tokens.map(token => token.value).join(""));
    }
}