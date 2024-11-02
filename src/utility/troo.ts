export function Troo<T>(x: T | undefined | null | false, ...rest: any[]): x is T {
    return Boolean(x);
}

export function Defined<T>(x: T | undefined, ...rest: any[]): x is T {
    return Boolean(x);
}

export function IsA<T>(ctor: new (...params: any[]) => T): (x: any) => x is T {
    return (x: any): x is T => x instanceof ctor;
}