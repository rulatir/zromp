import {ParsedAttribute} from "../parsed-attribute.ts";

export class SrcSetLike extends ParsedAttribute {
    parseAttributeValue(attributeValue: string): Array<{ type: "url" | "text"; value: string }> {
        const parts: Array<{ type: "url" | "text"; value: string }> = [];
        const regex = /(\s*[^,\s]+(?:\s+\d+[wx])?(?:\s+\d+[wx])?\s*(?:,|$))/g;
        let match;
        while ((match = regex.exec(attributeValue)) !== null) {
            parts.push({type: "url", value: match[1]});
        }
        return parts;
    }
}