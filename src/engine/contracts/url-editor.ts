export default interface IURLEditor {
    element: HTMLElement;
    attributeName: string;

    getURLs(): string[];

    replaceURL(index: number, newURL: string): void;

    apply(): void;
}