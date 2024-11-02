import {InnerHtmlAccessor} from "@src/engine/fragments/accessor/inner-html-accessor.ts";
import {ElementRule} from "@src/engine/rules/inner-html-rules.ts";
import {Finder} from "@src/engine/fragments/finder/finder.ts";
import {URLEditor} from "@src/engine/fragments/url-editor.ts";
import {IsA} from "@src/utility/troo.ts";

export class ElementFinder extends Finder<ElementRule> {
    *find(root: HTMLElement): IterableIterator<URLEditor> {
        for (let rule of this.rules) {
            for (let element of [...root.querySelectorAll(rule.selector)].filter(IsA(HTMLElement))) {
                yield URLEditor.from(new InnerHtmlAccessor(element), rule.op);
            }
        }
    }
}