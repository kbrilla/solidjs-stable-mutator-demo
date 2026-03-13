// Memo Caching — Stable Narrowing for Derived State
// Based on: https://docs.solidjs.com/concepts/derived-values/memos
//
// Memos are pure functions that cache results.
// Since createMemo returns Accessor<T> (which is stable),
// the cached value preserves narrowing across repeated reads.

import { createSignal, createMemo, Accessor } from "solid-js";

// ── Memo vs derived signal ─────────────────────────────────────
// From SolidJS docs: both produce derived values, but memos cache

const [firstName] = createSignal<string | null>("John");
const [lastName] = createSignal<string | null>("Doe");

// A memo caches the full name computation
const fullName: Accessor<string | null> = createMemo(() => {
    const f = firstName();
    const l = lastName();
    if (f === null || l === null) return null;
    return `${f} ${l}`;
});

// Stable accessor — repeated reads preserve narrowing
if (fullName() !== null) {
    fullName().toUpperCase();         // ✅ narrowed to string
    fullName().split(" ");            // ✅ still narrowed
    const len: number = fullName().length; // ✅ .length available
}

// ── Conditional memo with discriminated union ──────────────────

type FetchResult<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; error: string };

const [response] = createSignal<FetchResult<string>>({ status: "idle" });

const displayText: Accessor<FetchResult<string>> = createMemo(() => response());

switch (displayText().status) {
    case "loading":
        break;
    case "success":
        displayText().data.toUpperCase();  // ✅ narrowed to success variant
        break;
    case "error":
        displayText().error.toUpperCase(); // ✅ narrowed to error variant
        break;
}

// ── Transform data with memo ───────────────────────────────────

const [rawItems] = createSignal<string[] | undefined>(["apple", "banana"]);

const sortedItems: Accessor<string[] | undefined> = createMemo(() => {
    const items = rawItems();
    if (items === undefined) return undefined;
    return [...items].sort();
});

if (sortedItems() !== undefined) {
    for (const item of sortedItems()) {  // ✅ narrowed to string[]
        item.toUpperCase();
    }
}
