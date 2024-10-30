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

    parseAttributeValue(attributeValue: string): Array<{ type: 'url' | 'text', value: string }> {
        // Implement parsing logic to split attributeValue into URLs and text parts
        const parts: Array<{ type: 'url' | 'text', value: string }> = [];
        // Example parsing logic (simplified):
        const regex = /(https?:\/\/[^\s]+)/g;
        let match;
        let lastIndex = 0;
        while ((match = regex.exec(attributeValue)) !== null) {
            if (match.index > lastIndex) {
                parts.push({type: 'text', value: attributeValue.substring(lastIndex, match.index)});
            }
            parts.push({type: 'url', value: match[0]});
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < attributeValue.length) {
            parts.push({type: 'text', value: attributeValue.substring(lastIndex)});
        }
        return parts;
    }

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