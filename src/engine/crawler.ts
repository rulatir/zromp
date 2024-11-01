import {mkdir, readFile, writeFile} from "node:fs/promises";
import MIMEType from "whatwg-mimetype";
import md5 from "md5";
import {dirname} from "node:path";
import {JSDOM} from "jsdom";
import {Resource} from "@src/engine/resource.ts";
import {attributeRules} from "@src/engine/rules/attribute-rules.ts";
import {innerHTMLRules} from "@src/engine/rules/inner-html-rules.ts";
import {AttributeFinder} from "@src/engine/rules/attribute-finder.ts";
import {caughtNew} from "@src/utility/caught.ts";

export class Crawler {

    private readonly cacheDir: string;
    private resources: Map<string, Resource>;
    private queue: Array<Resource>;
    private readonly workers: Set<Promise<Resource>>;
    private readonly maxWorkers: number;

    constructor(cacheDir: string, maxWorkers: number) {
        this.cacheDir = cacheDir;
        this.resources = new Map();
        this.queue = [];
        this.workers = new Set();
        this.maxWorkers = maxWorkers;
    }

    enqueue(...urls: URL[]) {
        for (let url of urls) {
            if (!this.resources.has(url.href)) {
                const resource = new Resource(url, this.contentFilePath(url));
                this.resources.set(url.href, resource);
                this.queue.push(resource);
            }
        }
    }

    private contentFilePath(url: URL) {
        const hash = md5(url.href);
        return `${this.cacheDir}/${hash.substring(0,2)}/${hash.substring(2,4)}/${hash}`;
    }

    private normalizeError(e: unknown): Error {
        if (e instanceof Error) {
            return e;
        } else if (typeof e === "string") {
            return new Error(e);
        } else if (
            typeof e === "object"
            && e !== null
            && "toString" in e
            && typeof e.toString === "function"
            && e.toString() !== Object.prototype.toString.call({})
        ) {
            return new Error(e.toString());
        } else {
            return new Error("Unknown error");
        }
    }

    async _request(resource: Resource): Promise<Resource> {
        resource.state = "loading";
        const response = await fetch(resource.url.href);
        if (response.ok) {
            try {
                resource.mimeType = new MIMEType(response.headers.get("Content-Type") || "application/octet-stream");
                await mkdir(dirname(resource.contentFile), {recursive: true});
                await writeFile(resource.contentFile, await response.text());
                resource.state = "loaded";
            }
            catch (e) {
                resource.state = "error";
                resource.error = this.normalizeError(e);
            }
        }
        else {
            resource.state = "error";
            resource.error = new Error(`Failed to fetch ${resource.url.href}: ${response.status} ${response.statusText}`);
        }
        return resource;
    }

    request(resource: Resource): Promise<Resource> {
        resource.worker = this._request(resource);
        this.workers.add(resource.worker);
        return resource.worker;
    }

    async run() {
        while (this.queue.length > 0 || this.workers.size > 0) {
            this.queue.splice(0, this.maxWorkers - this.workers.size).forEach(resource => this.request(resource));

            const resource = await Promise.race(this.workers);
            if (resource.worker) {
                this.workers.delete(resource.worker);
                delete resource.worker;
            }
            if (resource.state === "loaded") {
                this.enqueue(...this.filterURLs(this.validateURLs(await this.extractURLs(resource))));
            }
        }
    }

    private async extractURLs(resource: Resource): Promise<string[]> {
        if (!resource.mimeType || !resource.mimeType.isHTML()) return [];
        const doc = new JSDOM(await readFile(resource.contentFile));
        return [...new Set([
            ...this.scanRootElement(resource, doc.window.document.querySelector("head")),
            ...this.scanRootElement(resource, doc.window.document.querySelector("body"))
        ])];
    }

    private scanRootElement(resource: Resource, element: HTMLElement | null): string[] {
        if (!element) return [];
        const urls: string[] = [];
        for(let finder of [new AttributeFinder(attributeRules), new ElementFinder(innerHTMLRules)]) {
            for (let editor of finder.find(element)) {
                resource.replacements.push(editor);
                urls.push(...editor.all());
            }
        }
        return [...new Set(urls)];
    }

    private validateURLs(urls: string[]): URL[] {
        return urls.map(caughtNew(URL)).filter(Boolean) as URL[];
    }

    private filterURLs(urls: URL[]) :URL[] {
        return urls;
    }
}

