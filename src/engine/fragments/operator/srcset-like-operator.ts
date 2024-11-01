import {URLEditor} from "../url-editor.ts";

import moo from "moo";
import {AttributeFragment} from "@src/engine/fragments/attribute-fragment.ts";

const lexer = moo.compile({
    WS: {match: /\s+/, lineBreaks: true},
    comma: ",",
    widthDescriptor: /[0-9]+w/,
    densityDescriptor: /(?:[0-9]+|\.[0-9]+|[0-9]+\.[0-9]+)(?:[eE][+-]?[0-9]+)?x/,
    url: /[^,\s]\S+[^,\s]/
});

export class SrcsetLikeOperator extends IOperator {

    private tokens!: moo.Token[];
    private urls!: moo.Token[];
    constructor(srcset: string) {
        this.parse(string);
    }

    all(): string[] {
        return this.urls.map(token => token.value);
    }

    put(index: number, newURL: string): void {
        if (index < 0 || index >= this.urls.length) {
            throw new Error("Out-of-bounds index of URL string within attribute value");
        }
        this.urls[index].value = newURL;
    }

    text(): string {
        return this.tokens.map(token => token.value).join("");
    }

    private parse(value: string): void {
        this.tokens = Array.from(lexer.reset(value));
        this.urls = this.tokens.filter(token => token.type === "url");
    }
}