// Linked type predicates: guard methods that narrow stable endpoints
// this.method() is Type syntax
export {};

interface Resource<T> {
    value: stable () => T;
    hasValue(): this.value() is Exclude<T, undefined>;
}

declare const r: Resource<string | undefined>;

if (r.hasValue()) {
    const s: string = r.value();  // ✅ narrowed to string via linked predicate
}

// Method-level invalidation
interface Store<T> {
    stable getValue(): T;
    stable getLabel(): string;
    mutator setValue(v: T): void invalidates getValue;
    mutator setLabel(l: string): void invalidates getLabel;
    mutator reset(): void invalidates getValue, getLabel;
}

declare const myStore: Store<string | undefined>;

if (myStore.getValue() !== undefined) {
    myStore.setLabel("test");                     // does NOT invalidate getValue
    myStore.getValue().toUpperCase();             // ✅ still narrowed

    myStore.setValue("hello");                    // invalidates getValue
    myStore.getValue().toUpperCase();             // ✅ post-call narrowed to string
}
