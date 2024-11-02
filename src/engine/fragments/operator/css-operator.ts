import {
    tokenize,
    CSSToken,
    isTokenFunction,
    isTokenURL,
    isTokenString,
    TokenURL, TokenString
} from "@csstools/css-tokenizer";
import IOperator from "@src/engine/contracts/fragments/operator.ts";

enum TokenField {
    // noinspection JSUnusedGlobalSymbols
    TYPE,
    REPRESENTATION,
    START,
    END,
    DATA
}
export class CssOperator implements IOperator {

    private tokens!: CSSToken[];
    private urlTokens!: (TokenURL|TokenString)[];
    constructor(private css: string) {
        this.parse()
    }

    all(): string[] {
        return this.urlTokens.map(token => token[TokenField.DATA].value);
    }

    put(index: number, newURL: string): void {
        if (index < 0 || index >= this.urlTokens.length) {
            throw new Error("Out-of-bounds index of URL string CSS fragment");
        }
        const token = this.urlTokens[index];
        token[TokenField.DATA].value = newURL;
        token[TokenField.REPRESENTATION] = isTokenString(token)
            ? this.quoteCSSString(newURL, token[TokenField.REPRESENTATION].startsWith("'"))
            : newURL;
    }

    text(): string {
        return this.tokens.map(token => token[TokenField.REPRESENTATION]).join("");
    }

    private parse(): void {
        this.tokens = tokenize({css: this.css});
        this.urlTokens = [];
        let processingUrl: boolean = false;
        for (let token of this.tokens) {
            if (isTokenURL(token) || processingUrl && isTokenString(token)) {
                this.urlTokens.push(token);
                processingUrl = false;
            } else if (isTokenFunction(token) && token[TokenField.DATA].value === "url") {
                processingUrl = true;
            }
        }
    }

    private quoteCSSString(newURL: string, useSingleQuotes: boolean): string {
        const escapedURL = newURL.replace(/\\/g, "\\\\");
        const quote = useSingleQuotes ? "'" : '"';
        const needsEscaping = useSingleQuotes ? escapedURL.includes("'") : escapedURL.includes('"');
        const finalURL = needsEscaping ? escapedURL.replace(new RegExp(quote, 'g'), `\\${quote}`) : escapedURL;
        return `${quote}${finalURL}${quote}`;
    }
}
