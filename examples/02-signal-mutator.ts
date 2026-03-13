// Signal Mutation and Invalidation
// Shows how mutator/invalidates works with SolidJS signals
//
// When setCount() is called, it invalidates count()'s narrowing.
// Post-call narrowing then narrows count() to the argument type.

import { createSignal } from "solid-js";

// ── Basic mutator invalidation ─────────────────────────────────

const [count, setCount] = createSignal<number | undefined>(0);

if (count() !== undefined) {
    const n: number = count();        // ✅ narrowed to number

    setCount(42);                     // mutator call → invalidates read
    // Post-call narrowing: count() is narrowed to number (argument: 42)
    const a: number = count();        // ✅ narrowed to number

    setCount(undefined);              // mutator call → invalidates read
    // Post-call narrowing: count() is narrowed to undefined
    const b: undefined = count();     // ✅ narrowed to undefined
}

// ── Multiple signals are independent ───────────────────────────

const [x, setX] = createSignal<string | null>("hello");
const [y, setY] = createSignal<number | null>(42);

if (x() !== null && y() !== null) {
    setX("world");                    // only invalidates x's read
    const s: string = x();           // ✅ post-call narrowed to string
    const n: number = y();           // ✅ y still narrowed — independent

    setY(null);                       // only invalidates y's read
    const s2: string = x();          // ✅ x still narrowed
    const n2: null = y();            // ✅ post-call narrowed to null
}

// ── Re-narrowing after mutation ─────────────────────────────────

const [score, setScore] = createSignal<number | undefined>(100);

if (score() !== undefined) {
    // Direct value mutation
    setScore(200);
    const s: number = score();        // ✅ post-call narrowed to number

    // To use a computed value, re-check after mutation:
    setScore(undefined);
    if (score() !== undefined) {
        const s2: number = score();   // ✅ re-narrowed after check
    }
}
