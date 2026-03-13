// Signal Narrowing with stable Accessor
// Based on: https://docs.solidjs.com/concepts/signals
//
// SolidJS uses createSignal() which returns [Accessor<T>, Setter<T>].
// With the `stable` modifier on Accessor, TypeScript-Go preserves
// narrowing across repeated calls to the same signal.

import { createSignal, Accessor } from "solid-js";

// ── Basic signal creation ──────────────────────────────────────

const [count, setCount] = createSignal<number | undefined>(0);

// Standard TypeScript loses narrowing on the second call:
//   if (count() !== undefined) {
//     count().toFixed(2);  // ❌ tsc: error — might be undefined
//   }
//
// With stable Accessor, tsgo preserves it:
if (count() !== undefined) {
    const a: number = count();        // ✅ narrowed to number
    count().toFixed(2);               // ✅ .toFixed available
    const b: number = count() + 1;    // ✅ arithmetic works
}

// ── Discriminated union narrowing ──────────────────────────────

type AppState =
    | { status: "loading" }
    | { status: "success"; data: string }
    | { status: "error"; message: string };

const [state, setState] = createSignal<AppState>({ status: "loading" });

if (state().status === "success") {
    state().data.toUpperCase();       // ✅ narrowed to success variant
}

// ── Exhaustive switch ──────────────────────────────────────────

switch (state().status) {
    case "loading": break;
    case "success":
        state().data;                 // ✅ narrowed
        break;
    case "error":
        state().message;              // ✅ narrowed
        break;
    default:
        const _: never = state();     // ✅ exhaustiveness check
}

// ── Typeof guard ───────────────────────────────────────────────

const [value] = createSignal<string | number | undefined>("hello");

if (typeof value() === "string") {
    value().toUpperCase();            // ✅ narrowed to string
} else if (typeof value() === "number") {
    value().toFixed(2);               // ✅ narrowed to number
}

// ── Multiple independent signals ───────────────────────────────

const [name] = createSignal<string | null>("Alice");
const [age] = createSignal<number | null>(30);

if (name() !== null && age() !== null) {
    const n: string = name();         // ✅ narrowed independently
    const a: number = age();          // ✅ narrowed independently
}

// ── Signal in loop ─────────────────────────────────────────────

const [items] = createSignal<number[] | undefined>([1, 2, 3]);

if (items() !== undefined) {
    for (const item of items()) {     // ✅ narrowed to number[]
        item.toFixed(2);
    }
}
