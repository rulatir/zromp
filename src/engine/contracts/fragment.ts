export default interface IFragment {

    load(): string;
    store(value: string): void;
}