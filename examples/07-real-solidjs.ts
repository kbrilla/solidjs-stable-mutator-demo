// Real SolidJS types — showing how minimal the change is
// Only 3 lines changed in SolidJS source to enable full narrowing
export {};

// SolidJS's actual Setter type (simplified)
type Setter<in out T> = {
    <U extends T>(value: (prev: T) => U): U;
    <U extends T>(value: Exclude<U, Function>): U;
    <U extends T>(value: Exclude<U, Function> | ((prev: T) => U)): U;
};

// The 3 changed lines:
type Accessor<T> = stable () => T;  // was: () => T
type Signal<T> = [get: Accessor<T>, set: mutator Setter<T> invalidates get];  // was: [get: Accessor<T>, set: Setter<T>]

declare function createSignal<T>(): Signal<T | undefined>;
declare function createSignal<T>(value: T, options?: {}): Signal<T>;

// Now narrowing works across signal reads
const [count, setCount] = createSignal<number | undefined>(0);

if (count() !== undefined) {
    // ✅ All of these work — stable preserves narrowing
    const a: number = count();
    count().toFixed(2);
    
    // ✅ Mutator invalidation via type reference
    setCount(42);
    const b: number = count();  // post-call narrowed to number
    
    setCount(undefined);
    const c = count();              // post-call narrowing reflects argument
}

// Multiple signals are independent
const [userName, setUserName] = createSignal<string | null>("Alice");
const [age, setAge] = createSignal<number | null>(30);

if (userName() !== null && age() !== null) {
    setUserName("Bob");          // only invalidates userName's read
    const n: string = userName(); // ✅ post-call narrowed
    const a: number = age();     // ✅ still narrowed — independent
}
