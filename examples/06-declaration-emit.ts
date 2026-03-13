// All stable/mutator/invalidates syntax is preserved in .d.ts output
// Run with: ./run.sh --declaration-emit

export type Accessor<T> = stable () => T;
export type LinkedSetter<T> = mutator (v: T) => void invalidates get;

export interface Store<T> {
    mutator setValue(v: T): void invalidates getValue;
    mutator reset(): void invalidates getValue, getLabel;
}

export type KeyedGetter<K, V> = stable[key] (key: K) => V | undefined;
export type KeyedSetter<K, V> = mutator[key] (key: K, value: V) => void invalidates get[key];

export interface TypedMap<K, V> {
    stable[key] get(key: K): V | undefined;
    mutator[key] set(key: K, value: V): void invalidates get[key];
}

// Complex type reference wrapping
interface Setter<T> {
    (value: T): T;
    (value: (prev: T) => T): T;
}

export type WrappedSignal<T> = [get: Accessor<T>, set: mutator Setter<T> invalidates get];

export class Container<T> {
    stable getValue(): T { return undefined as any; }
    mutator setValue(v: T): void invalidates getValue { }
}

// When run with --declaration-emit, the output .d.ts preserves ALL syntax exactly
