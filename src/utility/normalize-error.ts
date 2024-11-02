export function normalizeError(e: unknown): Error {
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
