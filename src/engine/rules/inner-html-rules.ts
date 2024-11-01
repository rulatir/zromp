import {CssOperator} from "@src/engine/fragments/operator/css-operator.ts";

export interface ElementRule {
    selector: string,
    op: new (value: string) => IOperator
}
export const innerHTMLRules = [
    {
        selector: 'style',
        op: CssOperator
    }
]