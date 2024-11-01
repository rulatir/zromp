import { expect } from "chai";
import { JSDOM } from "jsdom";
import { SrcsetLikeEditor } from "@src/engine/fragments/srcset-like-editor.ts";

describe("SrcSetLike", () => {
    let element: HTMLElement;
    let srcSetLike: SrcsetLikeEditor;

    beforeEach(() => {
        // noinspection HtmlUnknownTarget
        const dom = new JSDOM(`<img srcset="image1.jpg 1x, image2.jpg 2x" alt="foo" src="image1.jpg">`);
        element = dom.window.document.querySelector("img") as HTMLElement;
        srcSetLike = new SrcsetLikeEditor(element, "srcset", element.getAttribute("srcset") as string);
    });

    it("should parse URLs correctly", () => {
        const urls = srcSetLike.getURLs();
        expect(urls).to.deep.equal(["image1.jpg", "image2.jpg"]);
    });

    it("should replace URL correctly", () => {
        srcSetLike.replaceURL(1, "image3.jpg");
        const urls = srcSetLike.getURLs();
        expect(urls).to.deep.equal(["image1.jpg", "image3.jpg"]);
    });

    it("should apply changes to the element", () => {
        srcSetLike.replaceURL(1, "image3.jpg");
        srcSetLike.apply();
        expect(element.getAttribute("srcset")).to.equal("image1.jpg 1x, image3.jpg 2x");
    });

    it("should throw an error for out-of-bounds index", () => {
        expect(() => srcSetLike.replaceURL(2, "image4.jpg")).to.throw("Out-of-bounds index of URL string within attribute value");
    });
});