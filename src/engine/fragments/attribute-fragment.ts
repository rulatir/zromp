import IFragment from "@src/engine/contracts/fragment.ts";

export class AttributeFragment implements IFragment {

    private element: HTMLElement
    private attributeName: string
    constructor(element: HTMLElement, attributeName: string) {
        this.element = element;
        this.attributeName = attributeName;
    }

    load(): string {
        return this.element.getAttribute(this.attributeName) || "";
    }

    store(value: string): void {
        this.element.setAttribute(this.attributeName, value);
    }
}