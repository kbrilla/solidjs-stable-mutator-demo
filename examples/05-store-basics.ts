// Store Basics — Property Access vs Function Calls
// Based on: https://docs.solidjs.com/concepts/stores
//
// SolidJS stores use PROPERTY ACCESS (store.user), not function calls.
// TypeScript already narrows properties within basic blocks.
// stable/mutator adds value for FUNCTION-based state (signals, memos).
//
// This file shows how stores work and where stable/mutator bridges the gap.

// Note: solid-js/store is not available in this demo's types.
// Store examples use declare statements to show the concepts.

// ── Store creation ─────────────────────────────────────────────
// From SolidJS docs: createStore returns [state, setState]

interface User {
    id: number;
    username: string;
    location: string;
    loggedIn: boolean;
}

interface AppStore {
    userCount: number;
    users: User[];
}

// In real SolidJS: import { createStore } from "solid-js/store";
declare function createStore<T extends object>(init: T): [get: T, set: SetStoreFunction<T>];

interface SetStoreFunction<T> {
    <K extends keyof T>(key: K, value: T[K]): void;
    <K extends keyof T>(key: K, fn: (prev: T[K]) => T[K]): void;
}

const [store, setStore] = createStore<AppStore>({
    userCount: 3,
    users: [
        { id: 0, username: "felix909", location: "England", loggedIn: false },
        { id: 1, username: "tracy634", location: "Canada", loggedIn: true },
        { id: 2, username: "johny123", location: "India", loggedIn: true },
    ],
});

// ── Accessing store values ─────────────────────────────────────
// From SolidJS docs: store properties accessed directly

const userCount: number = store.userCount;          // direct property access
const firstUser: User = store.users[0];             // nested access
const username: string = store.users[0].username;   // deep nested

// ── Modifying store values ─────────────────────────────────────
// From SolidJS docs: use setter with key + value

setStore("userCount", 4);
setStore("users", (users) => [
    ...users,
    { id: 3, username: "michael584", location: "Nigeria", loggedIn: false },
]);

// ── Why stores don't need stable ───────────────────────────────
// Stores use property access — TypeScript ALREADY narrows properties.
// This works without any stable annotation:

interface NullableStore {
    name: string | undefined;
    count: number;
}

declare const myStore: NullableStore;

if (myStore.name !== undefined) {
    myStore.name.toUpperCase();       // ✅ TypeScript narrows properties natively
}

// ── But memos bridge stores to stable ──────────────────────────
// When you derive state from a store using createMemo,
// the result is an Accessor<T> (stable function).

import { createMemo, Accessor } from "solid-js";

const nameMemo: Accessor<string | undefined> = createMemo(() => myStore.name);

if (nameMemo() !== undefined) {
    nameMemo().toUpperCase();         // ✅ stable accessor preserves narrowing
}
