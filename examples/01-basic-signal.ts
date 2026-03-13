// Basic stable narrowing — the core feature
// A `stable` function returns the same value on repeated calls (absent mutation)
export {};

type Accessor<T> = stable () => T;

declare const count: Accessor<number | undefined>;

// Without stable: count() might return different values each time
// With stable: the compiler knows count() is consistent

if (count() !== undefined) {
    // ✅ All subsequent count() calls are narrowed to `number`
    const a: number = count();
    const b: number = count() + 1;
    count().toFixed(2);
}

// Exhaustive switch works too
type Status = "loading" | "success" | "error";
declare const appStatus: Accessor<Status>;

switch (appStatus()) {
    case "loading": break;
    case "success": break;
    case "error": break;
    default:
        const _: never = appStatus();  // ✅ exhaustiveness check
}

// Discriminated unions
type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "square"; side: number };

declare const shape: Accessor<Shape>;

if (shape().kind === "circle") {
    shape().radius;  // ✅ narrowed to circle
}
