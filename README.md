# SolidJS × TypeScript-Go: `stable`/`mutator`/`invalidates` Demo

A working, self-contained demo of the **`stable`/`mutator`/`invalidates`** TypeScript proposal — a type system extension that enables the compiler to narrow function return types across repeated calls.

This repo includes pre-built `tsgo` binaries (the native Go port of TypeScript) with full support for the new modifiers. Clone it, run a script, and see the narrowing in action — no build tools required.

## Quick Start

```bash
git clone https://github.com/kbrilla/solidjs-stable-mutator-demo.git
cd solidjs-stable-mutator-demo
chmod +x run.sh bin/*
./run.sh
```

## What You'll See

If everything works, the output will show:

```
╔══════════════════════════════════════════════════════════╗
║  SolidJS × TypeScript-Go: stable/mutator/invalidates   ║
╚══════════════════════════════════════════════════════════╝

Platform: darwin/arm64
Binary:   tsgo-darwin-arm64

Mode: Type Check (noEmit)
─────────────────────────

✅ All examples type-check successfully!
   No errors — stable/mutator/invalidates narrowing works.
```

**No errors = all 7 example files type-check with full narrowing support.**

Some examples use `@ts-expect-error` to demonstrate intentional failures (e.g., narrowing reset after mutation). These are expected and part of the demo.

## Examples Overview

| File | Description |
|------|-------------|
| `01-basic-signal.ts` | Core `stable` narrowing: repeated calls, exhaustive switch, discriminated unions |
| `02-mutator-invalidation.ts` | `mutator` resets narrowing; `invalidates` targets specific endpoints |
| `03-cross-binding.ts` | SolidJS `createSignal` pattern with cross-binding invalidation via tuple labels |
| `04-keyed-access.ts` | Per-key narrowing with `stable[key]` — Map-like patterns |
| `05-linked-predicates.ts` | Guard methods that narrow stable endpoints (`this.method() is Type`) |
| `06-declaration-emit.ts` | All syntax preserved in `.d.ts` output |
| `07-real-solidjs.ts` | Full SolidJS `Accessor`/`Setter`/`Signal` types — only 3 lines changed |

## How It Works

### `stable` — Idempotent reads

A `stable` function guarantees it returns the same value on repeated calls (absent mutation). This allows the compiler to preserve narrowing across calls:

```ts
type Accessor<T> = stable () => T;

declare const count: Accessor<number | undefined>;

if (count() !== undefined) {
    count().toFixed(2);  // ✅ narrowed to number
}
```

### `mutator` — State-changing writes

A `mutator` function may change state, which resets narrowing on stable endpoints:

```ts
declare const store: {
    read: stable () => string | undefined;
    write: mutator (v: string) => void;
};

if (store.read() !== undefined) {
    store.write("new");           // resets ALL stable narrowing
    store.read().toUpperCase();   // ❌ no longer narrowed
}
```

### `invalidates` — Targeted reset

`invalidates` specifies exactly which stable endpoints a mutator resets:

```ts
declare function createSignal<T>(value: T): [
    read: stable () => T,
    write: mutator (value: T) => void invalidates read
];

const [count, setCount] = createSignal<number | undefined>(0);

if (count() !== undefined) {
    setCount(42);              // only invalidates count's read
    const n: number = count(); // ✅ post-call narrowed to number
}
```

### `stable[key]` / `invalidates get[key]` — Per-key tracking

For Map-like patterns, narrowing is tracked per argument value:

```ts
interface TypedMap<K, V> {
    stable[key] get(key: K): V | undefined;
    mutator set(key: K, value: V): void invalidates get[key];
}
```

## Declaration Emit

Run with `--declaration-emit` to see that all new syntax is preserved in `.d.ts` output:

```bash
./run.sh --declaration-emit
cat out/examples/06-declaration-emit.d.ts
```

The output `.d.ts` files contain `stable`, `mutator`, `invalidates`, and `stable[key]` exactly as authored.

## SolidJS Integration

The SolidJS fork at [kbrilla/solid (stable-mutator-demo branch)](https://github.com/kbrilla/solid/tree/stable-mutator-demo) shows the minimal change needed:

**Only 3 lines changed in SolidJS's type definitions:**

```diff
- type Accessor<T> = () => T;
+ type Accessor<T> = stable () => T;

- type Signal<T> = [get: Accessor<T>, set: Setter<T>];
+ type Signal<T> = [get: Accessor<T>, set: mutator Setter<T> invalidates get];
```

That's it. All existing SolidJS code continues to work, and narrowing is automatically enabled.

## Building From Source

If you want to build `tsgo` yourself:

```bash
git clone https://github.com/kbrilla/typescript-go.git
cd typescript-go
git checkout stable-modifier  # or the relevant branch
npx hereby build
# Binaries are in built/local/
```

Cross-compile for other platforms:

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -tags='noembed,noassert' -o tsgo-linux-amd64 ./cmd/tsgo
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -tags='noembed,noassert' -o tsgo-darwin-arm64 ./cmd/tsgo
```

The binaries are fully self-contained — all lib files are embedded.

## Platform Support

| Platform | Architecture | Binary |
|----------|-------------|--------|
| macOS    | Apple Silicon (M1/M2/M3/M4) | `tsgo-darwin-arm64` |
| macOS    | Intel x86_64 | `tsgo-darwin-amd64` |
| Linux    | x86_64 | `tsgo-linux-amd64` |
| Linux    | ARM64/aarch64 | `tsgo-linux-arm64` |

Windows is not currently included. You can cross-compile from source if needed.

## Links

- **TypeScript-Go PR**: [kbrilla/typescript-go PR 2](https://github.com/kbrilla/typescript-go/pull/2) — full implementation
- **SolidJS Fork**: [kbrilla/solid (stable-mutator-demo)](https://github.com/kbrilla/solid/tree/stable-mutator-demo) — 3-line change demo
- **TypeScript-Go Repo**: [kbrilla/typescript-go](https://github.com/kbrilla/typescript-go)

## License

The `tsgo` binaries are built from [TypeScript-Go](https://github.com/microsoft/TypeScript-go) and are subject to its license terms. Example files in this repo are provided for demonstration purposes.
