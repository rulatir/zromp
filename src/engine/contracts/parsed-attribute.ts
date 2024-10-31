export default interface ParsedAttribute {
    element: HTMLElement;
    attributeName: string;

    getURLs(): string[];

    replaceURL(index: number, newURL: string): void;

    apply(): void;
}