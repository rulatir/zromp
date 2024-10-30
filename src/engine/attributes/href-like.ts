import {ParsedAttribute} from "../parsed-attribute.ts";

export class HrefLike extends ParsedAttribute {
    parseAttributeValue(attributeValue: string): Array<{ type: "url" | "text"; value: string }> {
        return [{type: "url", value: attributeValue}];
    }
}