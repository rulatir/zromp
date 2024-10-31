import {ParsedAttribute} from "../parsed-attribute.ts";

export class HrefLike extends ParsedAttribute {

    private url : string;
    constructor(element: HTMLElement, attributeName: string, attributeValue: string) {
        super(element, attributeName, attributeValue);
        this.url = attributeValue;
    }

    getURLs(): string[] {
        return [this.url];
    }

    replaceURL(index: number, newURL: string): void {
        if (index !== 0) {
            throw new Error("Out-of-bounds index of URL string within attribute value");
        }
        this.url = newURL;
    }

    apply(): void {
        this.element.setAttribute(this.attributeName, this.url);
    }
}