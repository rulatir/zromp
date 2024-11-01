import {URLEditor} from "@src/engine/url-editor.ts";
import IFragment from "@src/engine/contracts/fragment.ts";
import {ParseError, tokenize, CSSToken, isTokenFunction, isTokenURL, isTokenString} from "@csstools/css-tokenizer";

enum TokenField {
    TYPE,
    REPRESENTATION,
    START,
    END,
    DATA
}
export class CSSEditor extends URLEditor {

    private css?: string;
    private replacements: Map<string, string>;
    private urlTokens: CSSToken[];
    constructor(fragment: IFragment) {
        super(fragment);
        this.urlTokens = [];
    }

    protected parse(value: string): void {
        this.css = value;
        this.tokens = tokenize({
            css: this.css,
            onParseError: (error: ParseError) => { return; }
        });
        this.urlTokens = [];
        let processingUrl: boolean = false;
        for (let token of this.tokens) {
            if (isTokenURL(token) || processingUrl && isTokenString(token)) {
                this.urlTokens.push(token);
                processingUrl = false;
            } else if (isTokenFunction(token) && token.value === "url") {
                processingUrl = true;
            }
        }
    }

    getURLs(): string[] {
        return this.urlTokens.map(token => token[TokenField.DATA].value);
    }

    replaceURL(index: number, newURL: string): void {
        if (index < 0 || index >= this.urlTokens.length) {
            throw new Error("Out-of-bounds index of URL string CSS fragment");
        }
        const token = this.urlTokens[index];
        token[TokenField.DATA].value = newURL;
        token[TokenField.REPRESENTATION] = isTokenString(token)
            ? this.quoteCSSString(newURL, token[TokenField.REPRESENTATION].startsWith("'"))
            : newURL;
    }

    protected render(): string {
        return this.tokens.map(token => token[TokenField.REPRESENTATION]).join("");
    }

    private quoteCSSString(newURL: string, useSingleQuotes: boolean): string {
        const escapedURL = newURL.replace(/\\/g, "\\\\");
        const quote = useSingleQuotes ? "'" : '"';
        const needsEscaping = useSingleQuotes ? escapedURL.includes("'") : escapedURL.includes('"');
        const finalURL = needsEscaping ? escapedURL.replace(new RegExp(quote, 'g'), `\\${quote}`) : escapedURL;
        return `${quote}${finalURL}${quote}`;
    }
}
