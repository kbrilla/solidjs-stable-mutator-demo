// Store Produce Utility — Mutation with Immutable Semantics
// Based on: https://docs.solidjs.com/concepts/stores
//
// From SolidJS docs: `produce` lets you work with data as if mutable,
// then produces an immutable update. This maps naturally to `mutator`.

import { createMemo, Accessor } from "solid-js";

// ── produce as mutator ─────────────────────────────────────────

// produce-like utility that creates a mutator function
declare function typedProduce<T>(fn: (draft: T) => void): mutator (state: T) => T;

interface User {
    id: number;
    username: string;
    location: string;
    loggedIn: boolean;
}

// From SolidJS docs: produce allows batch updates
const updateUser = typedProduce<User>(user => {
    user.username = "newUsername";
    user.location = "newLocation";
});

// ── reconcile for data integration ─────────────────────────────
// From SolidJS docs: reconcile merges new data, only updating diffs

interface DataStore {
    animals: string[];
}

declare function typedReconcile<T>(newData: T): mutator (state: T) => T;

const mergeAnimals = typedReconcile<string[]>(["cat", "dog", "bird", "koala"]);

// ── Combining produce with stable memos ────────────────────────

interface AppState {
    user: string | undefined;
    count: number;
}

// Store state wrapped in stable accessor via createMemo
declare const appState: AppState;
const userMemo: Accessor<string | undefined> = createMemo(() => appState.user);
const countMemo: Accessor<number> = createMemo(() => appState.count);

if (userMemo() !== undefined) {
    userMemo().toUpperCase();         // ✅ narrowed — stable memo
    // After mutation, createMemo would recompute and narrowing restarts
}

// ── Store setters with path syntax ─────────────────────────────
// From SolidJS docs: setStore("users", 0, "loggedIn", false)
// Shows the path syntax concepts (these are runtime patterns)

interface StoreData {
    users: User[];
}

declare function createStore<T extends object>(init: T): [get: T, set: {
    // Simple key-value
    <K extends keyof T>(key: K, value: T[K]): void;
    // Path syntax with function
    <K extends keyof T>(key: K, fn: (prev: T[K]) => T[K]): void;
}];

const [store, setStore] = createStore<StoreData>({
    users: [
        { id: 0, username: "felix909", location: "England", loggedIn: false },
        { id: 1, username: "tracy634", location: "Canada", loggedIn: true },
    ],
});

// From SolidJS docs: modifying values
setStore("users", (currentUsers) => [
    ...currentUsers,
    { id: 3, username: "michael584", location: "Nigeria", loggedIn: false },
]);
