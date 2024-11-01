export class InnerHtmlFragment implements IFragment {

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