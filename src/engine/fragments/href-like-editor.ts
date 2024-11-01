import {URLEditor} from "../url-editor.ts";
import {AttributeFragment} from "@src/engine/fragments/attribute-fragment.ts";

export class HrefLikeEditor extends URLEditor {

    private url : string;
    constructor(element: HTMLElement, attributeName: string) {
        super(new AttributeFragment(element, attributeName));
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

    protected parse(value: string): void {
        this.url = value;
    }

    protected render(): string {
        return this.url;
    }
}