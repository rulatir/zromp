import IParsedAttribute from "./contracts/parsed-attribute.ts";

export abstract class ParsedAttribute implements IParsedAttribute {
    element: HTMLElement;
    attributeName: string;

    constructor(element: HTMLElement, attributeName: string, attributeValue: string) {
        this.element = element;
        this.attributeName = attributeName;
    }

    abstract getURLs(): string[];

    abstract replaceURL(index: number, newURL: string): void;

    abstract apply(): void;
}