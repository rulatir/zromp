export default interface IOperator {

    all(): string[];
    put(index: number, value: string): void;
    text(): string;
}