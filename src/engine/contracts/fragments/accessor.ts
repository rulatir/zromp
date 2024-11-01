export default interface IAccessor {

    load(): string;
    store(value: string): void;
}