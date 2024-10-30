import {Response} from "bun-types/fetch";
import {writeFile,readFile,mkdir} from "node:fs/promises";
import MIMEType from "whatwg-mimetype";
import md5 from "md5";
import {dirname} from "node:path";
import {JSDOM} from "jsdom";

export class Resource {

    url: URL;
    contentFile: string;
    mimeType?: MIMEType;
    state: "pending" | "loading" | "loaded" | "error";
    error?: Error;
    worker?: Promise<Resource>;

    constructor(url: URL, contentFile: string) {
        this.url = url;
        this.contentFile = contentFile;
        this.state = "pending";
    }
}

export class Crawler {

    #cacheDir: string;
    #resources: Map<string, Resource>;
    #queue: Array<Resource>;
    #workers: Set<Promise<Resource>>;
    #maxWorkers: number;

    constructor(cacheDir: string, maxWorkers: number) {
        this.#cacheDir = cacheDir;
        this.#resources = new Map();
        this.#queue = [];
        this.#workers = new Set();
        this.#maxWorkers = maxWorkers;
    }

    enqueue(...urls: URL[]) {
        for (let url of urls) {
            if (!this.#resources.has(url.href)) {
                const resource = new Resource(url, this.contentFilePath(url));
                this.#resources.set(url.href, resource);
                this.#queue.push(resource);
            }
        }
    }

    private contentFilePath(url: URL) {
        const hash = md5(url.href);
        return `${this.#cacheDir}/${hash.substring(0,2)}/${hash.substring(2,4)}/${hash}`;
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
        this.#workers.add(resource.worker);
        return resource.worker;
    }

    async run() {
        while (this.#queue.length > 0 || this.#workers.size > 0) {
            const numNewWorkers = this.#maxWorkers - Math.min(this.#workers.size, this.#maxWorkers);
            this.#queue
                .splice(0, numNewWorkers)
                .map(resource => this.request(resource))
                .forEach(worker => this.#workers.add(worker));

            const resource = await Promise.race(this.#workers);
            if (resource.worker) {
                this.#workers.delete(resource.worker);
                delete resource.worker;
            }
            if(resource.state === "loaded") {
                this.enqueue(...this.filterURLs(this.validateURLs(await this.extractURLs(resource))));
            }
        }
    }
    
    private validateURLs(urls: string[]): URL[] {
        return urls
            .map(url => {
                try {
                    return new URL(url);
                } catch (e) {
                    return null;
                }
            })
            .filter(url => url !== null) as URL[];
    }

    private async extractURLs(resource: Resource): Promise<string[]> {
        if (!resource.mimeType || !resource.mimeType.isHTML()) return [];
        const doc = new JSDOM(await readFile(resource.contentFile));
        return [
            ...this.scanRootElement(doc.window.document.querySelector("head")),
            ...this.scanRootElement(doc.window.document.querySelector("body"))
        ];
    }

    private filterURLs(urls: URL[]) :URL[] {
        return urls;
    }

    private scanRootElement(element: HTMLElement | null): string[] {
        if (!element) return [];
        const urls: string[] = [];
        for (let rule of rules) {
            const elements = element.querySelectorAll(rule.selector);
            for (let el of elements) {
                for (let attributeRule of rule.attributes) {
                    for(let attribute of el.attributes) {
                        if (attributeRule.match.test(attribute.name)) {
                            urls.push(...attributeRule.transform(attribute.value));
                        }
                    }
                }
            }
        }
        return [...new Set(urls)];
    }
}

const rules = [
    {
        selector: 'body a, head > link',
        attributes: [
            {
                match: /href$/,
                transform: (url: string) => [url]
            }
        ],
        transform: (_:string) => [_]
    },
    {
        selector: 'body img, body video, body video > source',
        attributes: [
            {
                match: /src$/,
                transform: (url: string) => [url]
            },
            {
                match: /srcset$/,
                transform: (url: string) => url.split(",").map(part => part.trim().split(/\s+/)[0])
            }
        ],
    }
]