import IParsedAttribute from "./contracts/parsed-attribute.ts";

export abstract class ParsedAttribute implements IParsedAttribute {
    element: HTMLElement;
    attributeName: string;
    parts: Array<{ type: 'url' | 'text', value: string }>;

    constructor(element: HTMLElement, attributeName: string, attributeValue: string) {
        this.element = element;
        this.attributeName = attributeName;
        this.parts = this.parseAttributeValue(attributeValue);
    }

    abstract parseAttributeValue(attributeValue: string): Array<{ type: 'url' | 'text', value: string }>;
    getURLs(): string[] {
        return this.parts.filter(part => part.type === 'url').map(part => part.value);
    }

    replaceURL(index: number, newURL: string) {
        let urlCount = 0;
        for (let part of this.parts) {
            if (part.type === 'url') {
                if (urlCount === index) {
                    part.value = newURL;
                    break;
                }
                urlCount++;
            }
        }
    }

    reassembleAndSetAttribute() {
        const newValue = this.parts.map(part => part.value).join('');
        this.element.setAttribute(this.attributeName, newValue);
    }
}