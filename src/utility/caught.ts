export function caughtNew(ctor: Function, otherwise) {
    return _ => {
        try { return new ctor(_); }
        catch(e) { return otherwise; }
    }
}

export function caught(mapper: Function, otherwise) {
    return _ => {
        try { return mapper(_); }
        catch(e) { return otherwise; }
    }
}

caught.New = caughtNew;
