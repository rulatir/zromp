import {mkdir, readFile, writeFile} from "node:fs/promises";
import MIMEType from "whatwg-mimetype";
import md5 from "md5";
import {dirname} from "node:path";
import {JSDOM} from "jsdom";
import {Resource} from "@src/engine/resource.ts";
import {attributeRules} from "@src/engine/rules/attribute-rules.ts";
import {innerHTMLRules} from "@src/engine/rules/inner-html-rules.ts";
import {AttributeFinder} from "@src/engine/rules/attribute-finder.ts";
import {caught} from "@src/utility/caught.ts";

export class ResourceCache {
    private readonly cacheDir: string;
    private resources: Map<string, Resource>;
    private contentFilePath(url: URL) : string {
        const hash = md5(url.href);
        return `${this.cacheDir}/${hash.substring(0,2)}/${hash.substring(2,4)}/${hash}`;
    }
    private has(url: URL) : boolean {
        return this.resources.has(url.href);
    }
    private get(url: URL) : Resource {
        return this.resources.get(url.href);
    }
    private put(resource: Resource) : void {
        this.resources.set(resource.absoluteURL.href, resource);
    }
}
export class Crawler {

    private readonly resourceCache: ResourceCache;
    private readonly queue: Array<Resource>;
    private readonly workers: Set<Promise<Resource>>;
    private readonly maxWorkers: number;

    constructor(cacheDir: string, maxWorkers: number) {

        this.resourceCache = new ResourceCache();
        this.queue = [];
        this.workers = new Set();
        this.maxWorkers = maxWorkers;
    }

    enqueue(baseURL: URL, ...urls: URL[]) {
        this.queue.push(...urls.map(ResourceRegistrator.bind(baseURL,this.resourceCache)).filter(Boolean));
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
        const response = await fetch(resource.absoluteURL.href);
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
            resource.error = new Error(`Failed to fetch ${resource.absoluteURL.href}: ${response.status} ${response.statusText}`);
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
                resource.replacers.push(editor);
                urls.push(...editor.all());
            }
        }
        return [...new Set(urls)];
    }

    private validateURLs(urls: string[]): URL[] {
        return urls.map(caught(URL)).filter(Boolean) as URL[];
    }

    private filterURLs(urls: URL[]) :URL[] {
        return urls;
    }
}
