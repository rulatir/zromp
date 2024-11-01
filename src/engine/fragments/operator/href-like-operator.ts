import {URLEditor} from "../url-editor.ts";
import {AttributeFragment} from "@src/engine/fragments/attribute-fragment.ts";
import IOperator from "@src/engine/contracts/fragments/operator.ts";

export class HrefLikeOperator implements IOperator {

    private url : string;
    constructor(value: string) {
        this.url = value;
    }

    all(): string[] {
        return [this.url];
    }

    put(index: number, newURL: string): void {
        if (index !== 0) {
            throw new Error("Out-of-bounds index of URL string within attribute value");
        }
        this.url = newURL;
    }

    text() {
        return this.url;
    }
}