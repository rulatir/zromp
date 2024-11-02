// For regular functions
export function caught<X, R>(transformer: (x: X) => R): (x: X) => R | undefined;
export function caught<X, R, F>(transformer: (x: X) => R, fallback: F): (x: X) => R | F;

// For constructors
export function caught<X, R>(transformer: new (x: X) => R): (x: X) => R | undefined;
export function caught<X, R, F>(transformer: new (x: X) => R, fallback: F): (x: X) => R | F;

// Implementation
export function caught(transformer: Function, fallback?: any) {
    return function(x: any) {
        try {
            if (transformer.prototype && transformer.prototype.constructor === transformer) {
                return new transformer(x);
            }
            return transformer(x);
        } catch {
            return fallback;
        }
    };
}