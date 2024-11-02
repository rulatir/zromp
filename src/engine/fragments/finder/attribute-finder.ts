import {AttributeAccessor} from "@src/engine/fragments/accessor/attribute-accessor.ts";
import {URLEditor} from "@src/engine/fragments/url-editor.ts";
import {ElementAttributeRule} from "@src/engine/rules/attribute-rules.ts";
import {Finder} from "@src/engine/fragments/finder/finder.ts";
export class AttributeFinder extends Finder<ElementAttributeRule> {

    *find(root: HTMLElement | null): IterableIterator<URLEditor> {
        if (!root) return;
        for (let rule of this.rules) {
            for (let element of root.querySelectorAll(rule.selector)) {
                for (let attributeRule of rule.attributes) {
                    for (let attribute of Array.from(element.attributes).filter(attr => attributeRule.match.test(attr.name))) {
                        yield URLEditor.from(new AttributeAccessor(element, attribute.name), attributeRule.op);
                    }
                }
            }
        }
    }
}