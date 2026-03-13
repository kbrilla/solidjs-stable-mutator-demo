// Combined Patterns — Signals + Memos + Stores
// Everything working together in a realistic application scenario

import { createSignal, createMemo, Accessor } from "solid-js";

// ── App state with signals ─────────────────────────────────────

type AuthState =
    | { status: "logged-out" }
    | { status: "logging-in" }
    | { status: "logged-in"; user: { name: string; role: "admin" | "user" } };

const [auth, setAuth] = createSignal<AuthState>({ status: "logged-out" });

// ── Derived memos from signals ─────────────────────────────────

const isLoggedIn: Accessor<boolean> = createMemo(() => auth().status === "logged-in");
const currentUser: Accessor<string | undefined> = createMemo(() => {
    const a = auth();
    return a.status === "logged-in" ? a.user.name : undefined;
});

// ── Signal narrowing ───────────────────────────────────────────

if (auth().status === "logged-in") {
    auth().user.name.toUpperCase();       // ✅ narrowed to logged-in variant
    auth().user.role;                     // ✅ "admin" | "user"
}

// ── Memo narrowing ─────────────────────────────────────────────

if (currentUser() !== undefined) {
    currentUser().toUpperCase();          // ✅ stable memo — narrowed to string
}

// ── Mutation resets narrowing ──────────────────────────────────

if (auth().status === "logged-in") {
    const name: string = auth().user.name;    // ✅ narrowed

    setAuth({ status: "logged-out" });        // mutator invalidates
    // Post-call narrowing: auth() is now { status: "logged-out" }
    auth().status;                            // "logged-out"
}

// ── Store bridge with keyed access ─────────────────────────────

interface StoreAccessor<T> {
    stable[key] get<K extends keyof T & string>(key: K): T[K];
}

interface StoreWriter<T> {
    mutator set<K extends keyof T & string>(key: K, value: T[K]): void invalidates get[key];
}

interface TodoStore {
    filter: "all" | "active" | "completed";
    items: { text: string; done: boolean }[] | undefined;
}

declare const todos: StoreAccessor<TodoStore>;
declare const setTodos: StoreWriter<TodoStore>;

// Per-key independence
if (todos.get("items") !== undefined) {
    setTodos.set("filter", "active");              // different key
    todos.get("items")!.length;                    // ✅ still narrowed

    setTodos.set("items", [{ text: "new", done: false }]);  // same key
    const newItems = todos.get("items");           // ✅ post-call narrowed
}

// Exhaustive switch on filter
switch (todos.get("filter")) {
    case "all": break;
    case "active": break;
    case "completed": break;
    default:
        const _: never = todos.get("filter");      // ✅ exhaustive
}
