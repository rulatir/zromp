import {URLEditor} from "@src/engine/fragments/url-editor.ts";

export abstract class Finder<Rule> {
    constructor(protected rules: Rule[]) {}
    abstract *find(): IterableIterator<URLEditor>;
}