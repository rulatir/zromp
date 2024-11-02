import IAccessor from "@src/engine/contracts/fragments/accessor.ts";

export class AttributeAccessor implements IAccessor {
    constructor(private readonly element: HTMLElement, private readonly attributeName: string) {}

    load(): string {
        return this.element.hasAttribute(this.attributeName) ? this.element.getAttribute(this.attributeName) || "" : "";
    }

    store(value: string): void {
        if (this.element.hasAttribute(this.attributeName)) this.element.setAttribute(this.attributeName, value);
    }
}