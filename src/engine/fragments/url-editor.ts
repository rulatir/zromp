import IURLEditor from "@src/engine/contracts/url-editor.ts";
import IOperator from "@src/engine/contracts/fragments/operator.ts";
import IAccessor from "@src/engine/contracts/fragments/accessor.ts";

export class URLEditor implements IURLEditor, IAccessor, IOperator {

    fragment: IAccessor;
    operator: IOperator;

    constructor(fragment: IAccessor, operator: IOperator) {
        this.fragment = fragment;
        this.operator = operator;
    }

    apply(): void {
        this.store(this.operator.text())
    }

    all(): string[] {
        return this.operator.all()
    }

    put(index: number, value: string): void {
        return this.operator.put(index, value);
    }

    text(): string {
        return this.operator.text();
    }

    load(): string {
        return this.fragment.load();
    }

    store(value: string): void {
        this.fragment.store(value);
    }

    static from(accessor: IAccessor, operatorConstructor: new(value: string) => IOperator): URLEditor {
        return new URLEditor(accessor, new operatorConstructor(accessor.load()));
    }
}

