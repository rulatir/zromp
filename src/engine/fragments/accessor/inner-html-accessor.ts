export class InnerHtmlAccessor implements IAccessor {
    private element: HTMLElement
    constructor(element: HTMLElement) {
        this.element = element;
    }

    load(): string {
        return this.element.innerHTML;
    }

    store(value: string): void {
        this.element.innerHTML = value;
    }
}
