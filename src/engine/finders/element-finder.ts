import {InnerHtmlAccessor} from "@src/engine/fragments/accessor/inner-html-accessor.ts";
import {ElementRule} from "@src/engine/rules/inner-html-rules.ts";
import {Finder} from "@src/engine/finders/finder.ts";

export class ElementFinder extends Finder<ElementRule> {
    constructor(private rules) {}
    *find(root: HTMLElement): IterableIterator<URLEditor> {
        for (let rule of this.rules) {
            for (let element of root.querySelectorAll(rule.selector)) {
                yield URLEditor.from(new InnerHtmlAccessor(element), rule.op);
            }
        }
    }
}