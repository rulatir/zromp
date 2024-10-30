export default interface ParsedAttribute {
    element: HTMLElement;
    attributeName: string;
    parts: Array<{ type: 'url' | 'text', value: string }>;

    parseAttributeValue(attributeValue: string): Array<{ type: 'url' | 'text', value: string }>;

    getURLs(): string[];

    replaceURL(index: number, newURL: string): void;

    reassembleAndSetAttribute(): void;
}