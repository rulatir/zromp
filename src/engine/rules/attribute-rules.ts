import {HrefLikeOperator} from "@src/engine/fragments/operator/href-like-operator.ts";
import {SrcsetLikeOperator} from "@src/engine/fragments/operator/srcset-like-operator.ts";

const hrefElements = [
    "body a",
    "link"
]
const srcElements = [
    "body img",
    "script",
    "body iframe",
    "body audio",
    "body video",
    "body source",
    "body track",
    "body embed"
];
const srcSetElements = [
    "body img",
    "body source"
];
const metas = [
    ['image', 'video', 'audio'].map(T => ['', ':url', ':secure_url'].map(S => T + S)).flat().map(M => `meta[property="og:${M}"]`),
    [':image', ':image:src', ':player', ':player:stream', ':app:url'].map(S => `meta[name="twitter:${S}"]`)
].flat();

export interface AttributeRule {
    match: RegExp;
    op: new (value: string) => IOperator;
}

export interface ElementAttributeRule {
    selector: string;
    attributes: AttributeRule[];
}

export const attributeRules: ElementAttributeRule[] = [
    {
        selector: hrefElements.join(', '),
        attributes: [
            { match: /href$/, op: HrefLikeOperator }
        ]
    },
    {
        selector: srcElements.join(', '),
        attributes: [
            { match: /src$/, op: HrefLikeOperator }
        ]
    },
    {
        selector: srcSetElements.join(', '),
        attributes: [
            { match: /srcset$/, op: SrcsetLikeOperator }
        ]
    },
    {
        selector: 'link[rel="preload"]',
        attributes: [
            { match: /imagesrcset$/, op: SrcsetLikeOperator }
        ]
    },
    {
        selector: metas.join(', '),
        attributes: [
            { match: /^content$/, op: HrefLikeOperator }
        ]
    }
];