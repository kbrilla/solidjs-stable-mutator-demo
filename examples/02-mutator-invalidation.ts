// Mutator marks a function as state-changing
// invalidates targets specific stable endpoints to reset
export {};

declare const store: {
    read: stable () => string | undefined;
    write: mutator (v: string) => void;
};

if (store.read() !== undefined) {
    store.read().toUpperCase();   // ✅ narrowed to string
    store.write("new");           // mutator call without invalidates → resets ALL stable narrowing
    // After untargeted mutator, narrowing is conservatively dropped
    const v = store.read();       // string | undefined — must re-check
}

// With targeted invalidation via `invalidates`
declare const app: {
    user: stable () => string | undefined;
    settings: stable () => { theme: string } | undefined;
    setUser: mutator (v: string | undefined) => void invalidates user;
};

if (app.user() !== undefined && app.settings() !== undefined) {
    app.setUser("Alice");
    // user() was invalidated — but post-call narrowed to string via argument
    const u: string = app.user();
    // settings() was NOT invalidated — still narrowed
    app.settings()!.theme;  // ✅ still narrowed
}
