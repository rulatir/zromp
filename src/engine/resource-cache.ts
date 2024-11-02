import {Resource} from "@src/engine/resource.ts";
import md5 from "md5";

export class ResourceCache {

    private resources: Map<string, Resource>;

    constructor(private readonly cacheDir: string) {
        this.resources = new Map();
    }
    contentFilePath(url: URL): string {
        const hash = md5(url.href);
        return `${this.cacheDir}/${hash.substring(0, 2)}/${hash.substring(2, 4)}/${hash}`;
    }

    has(url: URL): boolean {
        return this.resources.has(url.href);
    }

    get(url: URL): Resource|undefined {
        return this.resources.get(url.href);
    }

    put(resource: Resource): void {
        this.resources.set(resource.absoluteURL.href, resource);
    }
}