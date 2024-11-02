import MIMEType from "whatwg-mimetype";
import {URLEditor} from "@src/engine/fragments/url-editor.ts";
import {ResourceCache} from "@src/engine/crawler.ts";

export class Resource {

    readonly absoluteURL: URL;
    readonly contentFile: string;
    mimeType?: MIMEType;
    state: "pending" | "loading" | "loaded" | "error";
    error?: Error;
    worker?: Promise<Resource>;
    readonly replacers: URLEditor[];

    constructor(absoluteURL: URL, contentFile: string) {
        this.absoluteURL = absoluteURL;
        this.baseURL = absoluteURL;
        this.absoluteURL = new URL(absoluteURL.href, baseURL.href);
        this.contentFile = contentFile;
        this.state = "pending";
        this.replacers = [];
    }
}

export class ResourceRegistrator {
    protected constructor(readonly baseURL: URL, readonly resourceCache: ResourceCache) {}
    protected register(url: URL) : ?Resource {
        const absoluteURL = new URL(url.href, this.baseURL.href);
        if (this.resourceCache.has(absoluteURL)) return;
        const resource = new Resource(absoluteURL, this.baseURL, this.resourceCache.contentFilePath(url));
        this.resourceCache.put(resource);
        return resource;
    }
    static bind(readonly baseURL: URL, readonly resourceCache: ResourceCache) : (url: URL) => ?Resource {
        return (new ResourceRegistrator(baseURL, resourceCache)).register.bind(this);
    }
}