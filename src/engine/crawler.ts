import {mkdir, readFile, writeFile} from "node:fs/promises";
import MIMEType from "whatwg-mimetype";
import {dirname} from "node:path";
import {JSDOM} from "jsdom";
import {Resource, ResourceRegistrator} from "@src/engine/resource.ts";
import {attributeRules} from "@src/engine/rules/attribute-rules.ts";
import {innerHTMLRules} from "@src/engine/rules/inner-html-rules.ts";
import {caught} from "@src/utility/caught.ts";
import {normalizeError} from "@src/utility/normalize-error.ts";
import {ResourceCache} from "@src/engine/resource-cache.ts";
import {AttributeFinder} from "@src/engine/fragments/finder/attribute-finder.ts";
import {ElementFinder} from "@src/engine/fragments/finder/element-finder.ts";
import {Defined} from "@src/utility/troo.ts";

export class Crawler {

    private readonly resourceCache: ResourceCache;
    private readonly queue: Array<Resource>;
    private readonly workers: Set<Promise<Resource>>;
    private readonly maxWorkers: number;

    constructor(cacheDir: string, maxWorkers: number) {

        this.resourceCache = new ResourceCache(cacheDir);
        this.queue = [];
        this.workers = new Set();
        this.maxWorkers = maxWorkers;
    }

    enqueue(baseURL: URL, ...urls: URL[]) {
        this.queue.push(...urls.map(ResourceRegistrator.bind(baseURL,this.resourceCache)).filter(Defined<Resource>));
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
                resource.error = normalizeError(e);
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
                this.enqueue(
                    resource.absoluteURL,
                    ...this.filterURLs(this.validateURLs(await this.extractURLs(resource)))
                );
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
