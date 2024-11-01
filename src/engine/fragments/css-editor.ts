import {URLEditor} from "@src/engine/url-editor.ts";
import IFragment from "@src/engine/contracts/fragment.ts";
import {ParseError, tokenize, TokenType, CSSToken, isTokenFunction, isTokenURL} from "@csstools/css-tokenizer";

enum TokenField {
    TYPE,
    REPRESENTATION,
    START,
    END,
    DATA
}
export class CSSEditor extends URLEditor {

    private css?: string;
    private replacements: Map<>
    constructor(fragment: IFragment) {
        super(fragment);
    }

    protected parse(value: string): void {
        this.css=string;
        this.tokens = tokenize({
            css: this.css,
            onParseError: (error: ParseError) => { return; }
        });
        this.urlTokens = [];
        let processingUrl : boolean = false;
        for(let token: CSSToken of this.tokens) {
            //implement this
        }
    }
}