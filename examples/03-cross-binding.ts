// SolidJS pattern: getter and setter are separate bindings from a tuple
// Named tuple labels enable cross-binding invalidation
export {};

declare function createSignal<T>(value: T): [
    read: stable () => T,
    write: mutator (value: T) => void invalidates read
];

const [count, setCount] = createSignal<number | undefined>(0);

if (count() !== undefined) {
    count().toFixed(2);          // ✅ narrowed to number
    
    setCount(42);                // cross-binding invalidation via tuple label
    // Post-call narrowing: count() is now narrowed to number (argument type)
    const n: number = count();   // ✅ narrowed to number
    
    setCount(undefined);
    // Post-call narrowing: count() type reflects the argument
    const u = count();            // narrowed based on argument type
}

// Multi-signal independence
const [a, setA] = createSignal<string | null>("hello");
const [b, setB] = createSignal<number | null>(42);

if (a() !== null && b() !== null) {
    setA("world");           // only invalidates a's read
    const s: string = a();   // ✅ post-call narrowed to string
    const n: number = b();   // ✅ still narrowed — independent signal
}
