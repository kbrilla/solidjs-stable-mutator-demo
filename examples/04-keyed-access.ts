// Per-key narrowing with stable[key] — like Map.has/Map.get
// stable[key] tracks stability per argument value
export {};

interface TypedMap<K, V> {
    stable[key] get(key: K): V | undefined;
    mutator set(key: K, value: V): void invalidates get[key];
    mutator delete(key: K): boolean invalidates get[key];
    mutator clear(): void;  // no [key] → invalidates ALL keys
}

declare const map: TypedMap<string, number>;

if (map.get("x") !== undefined) {
    const a: number = map.get("x");    // ✅ narrowed (same key)
    const b = map.get("y");            // number | undefined (different key)

    map.set("y", 42);                  // invalidates only get("y")
    const c: number = map.get("x");    // ✅ still narrowed — different key
}

// Store-like pattern with keyed access
interface StoreAccessor<T> {
    stable[key] get<K extends keyof T & string>(key: K): T[K];
}

interface StoreWriter<T> {
    mutator set<K extends keyof T & string>(key: K, value: T[K]): void invalidates get[key];
}

interface AppState {
    user: string | undefined;
    count: number;
    status: "loading" | "ready" | "error";
}

declare const reader: StoreAccessor<AppState>;
declare const writer: StoreWriter<AppState>;

if (reader.get("user") !== undefined) {
    writer.set("count", 99);                    // different key
    const u: string = reader.get("user");       // ✅ still narrowed

    writer.set("user", "bob");                  // same key → invalidates
    const u2: string = reader.get("user");      // ✅ post-call narrowed to string
}
