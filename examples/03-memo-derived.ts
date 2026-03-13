// Memos — Derived Values with Stable Narrowing
// Based on: https://docs.solidjs.com/concepts/derived-values/memos
//
// createMemo returns Accessor<T> which is `stable () => T`.
// This means memoized derived values preserve narrowing across calls.

import { createSignal, createMemo, Accessor } from "solid-js";

// ── Basic memo creation ────────────────────────────────────────
// From SolidJS docs: memos cache derived computations

const [count, setCount] = createSignal(0);

const isEven: Accessor<boolean> = createMemo(() => count() % 2 === 0);

// isEven() is stable — same result on repeated calls
if (isEven()) {
    // We're in the "true" branch — isEven() stays true
}

// ── Memo with narrowable type ──────────────────────────────────

const [data, setData] = createSignal<string | null>("hello");

const upperCase: Accessor<string | null> = createMemo(() => {
    const d = data();
    return d !== null ? d.toUpperCase() : null;
});

if (upperCase() !== null) {
    upperCase().length;               // ✅ narrowed to string — stable memo
    const s: string = upperCase();    // ✅ stays narrowed
}

// ── Memo for expensive computation ─────────────────────────────
// From SolidJS docs: memos execute only once per dependency change

const [users] = createSignal<{ name: string; active: boolean }[]>([
    { name: "Alice", active: true },
    { name: "Bob", active: false },
    { name: "Charlie", active: true },
]);

const activeUsers: Accessor<{ name: string; active: boolean }[]> = createMemo(() =>
    users().filter(u => u.active)
);

// activeUsers() is a stable accessor — the filtered array stays narrowed
const first = activeUsers()[0];
if (first) {
    first.name.toUpperCase();         // ✅ narrowed
}

// ── Memo chain ─────────────────────────────────────────────────
// Memos can depend on other memos, building a reactive computation graph

const activeCount: Accessor<number> = createMemo(() => activeUsers().length);
const hasActiveUsers: Accessor<boolean> = createMemo(() => activeCount() > 0);

if (hasActiveUsers()) {
    // We know there are active users — stable composition
}

// ── Memo as aggregated state ───────────────────────────────────

type Stats = {
    total: number;
    active: number;
    inactive: number;
} | undefined;

const stats: Accessor<Stats> = createMemo(() => {
    const all = users();
    if (all.length === 0) return undefined;
    return {
        total: all.length,
        active: all.filter(u => u.active).length,
        inactive: all.filter(u => !u.active).length,
    };
});

if (stats() !== undefined) {
    const s = stats();                // ✅ narrowed to Stats (not undefined)
    s.total + s.active;               // ✅ all properties accessible
}
