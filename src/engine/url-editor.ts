import IURLEditor from "./contracts/url-editor.ts";
import IFragment from "@src/engine/contracts/fragment.ts";

export abstract class URLEditor implements IURLEditor {

    fragment: IFragment

    constructor(fragment: IFragment) {
        this.fragment = fragment;
        this.parse(this.fragment.load());
    }

    abstract getURLs(): string[];

    abstract replaceURL(index: number, newURL: string): void;

    protected abstract parse(value: string): void
    protected abstract render(): string

    apply(): void {
        tis.fragment.store(this.render());
    }
}