import MIMEType from "whatwg-mimetype";
import {URLEditor} from "@src/engine/fragments/url-editor.ts";

export class Resource {

    url: URL;
    contentFile: string;
    mimeType?: MIMEType;
    state: "pending" | "loading" | "loaded" | "error";
    error?: Error;
    worker?: Promise<Resource>;
    replacements: URLEditor[]

    constructor(url: URL, contentFile: string) {
        this.url = url;
        this.contentFile = contentFile;
        this.state = "pending";
        this.replacements = [];
    }
}