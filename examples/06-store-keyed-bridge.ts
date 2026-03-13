// Store Keyed Access Bridge Pattern
// Based on: https://docs.solidjs.com/concepts/stores
//
// SolidJS stores use property access (store.user), but stable/mutator
// works on FUNCTIONS. This bridge pattern wraps store access in keyed
// stable methods for per-key narrowing.
//
// stable[key] tracks stability per argument — get("user") and get("count")
// are tracked independently.
// invalidates get[key] means set("user") only resets get("user"), not get("count").

import { createMemo, Accessor } from "solid-js";

// ── StoreAccessor / StoreWriter interfaces ─────────────────────

interface StoreAccessor<T> {
    stable[key] get<K extends keyof T & string>(key: K): T[K];
}

interface StoreWriter<T> {
    mutator set<K extends keyof T & string>(key: K, value: T[K]): void invalidates get[key];
}

// ── Usage with app state ───────────────────────────────────────

interface AppState {
    user: string | undefined;
    count: number;
    status: "loading" | "ready" | "error";
}

declare const reader: StoreAccessor<AppState>;
declare const writer: StoreWriter<AppState>;

// Per-key narrowing — writing "count" does NOT invalidate "user"
if (reader.get("user") !== undefined) {
    const u: string = reader.get("user");      // ✅ narrowed

    writer.set("count", 99);                   // different key
    const u2: string = reader.get("user");     // ✅ still narrowed!

    writer.set("user", "bob");                 // same key → invalidates
    const u3: string = reader.get("user");     // ✅ post-call narrowed from arg
}

// ── Exhaustive switch on keyed field ───────────────────────────
// From SolidJS docs: store fields can be discriminants

switch (reader.get("status")) {
    case "loading":
        const l: "loading" = reader.get("status");   // ✅ narrowed
        break;
    case "ready":
        const r: "ready" = reader.get("status");     // ✅ narrowed
        break;
    case "error":
        const e: "error" = reader.get("status");     // ✅ narrowed
        break;
    default:
        const _: never = reader.get("status");       // ✅ exhaustive
}

// ── Independent stores don't cross-invalidate ──────────────────

interface UserState {
    userName: string | undefined;
    email: string | undefined;
}

interface CounterState {
    value: number | undefined;
    max: number;
}

declare const userRdr: StoreAccessor<UserState>;
declare const userWrt: StoreWriter<UserState>;
declare const cntRdr: StoreAccessor<CounterState>;
declare const cntWrt: StoreWriter<CounterState>;

if (userRdr.get("userName") !== undefined && cntRdr.get("value") !== undefined) {
    cntWrt.set("value", undefined);                  // counter change
    const n: string = userRdr.get("userName");       // ✅ user still narrowed

    userWrt.set("email", "test@example.com");        // different key
    const n2: string = userRdr.get("userName");      // ✅ still narrowed

    userWrt.set("userName", undefined);              // same key → invalidates
    const n3 = userRdr.get("userName");              // back to string | undefined
}
