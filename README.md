# SolidJS x TypeScript-Go: `stable`/`mutator`/`invalidates` Demo

**Working Demo** | Imports from **real SolidJS fork** types

A self-contained demo of the **`stable`/`mutator`/`invalidates`** TypeScript proposal using **actual SolidJS type definitions** from the [kbrilla/solid](https://github.com/kbrilla/solid/tree/stable-mutator-demo) fork. Not just `declare` statements -- real imports from real `.d.ts` files.

This repo includes pre-built `tsgo` binaries (the native Go port of TypeScript) with full support for the new modifiers. Clone it, run a script, and see narrowing in action.

## Quick Start

```bash
git clone https://github.com/kbrilla/solidjs-stable-mutator-demo.git
cd solidjs-stable-mutator-demo
chmod +x run.sh bin/*
./run.sh
```

## What You'll See

```
  SolidJS x TypeScript-Go: stable/mutator/invalidates
  ===================================================

Platform: darwin/arm64
Binary:   tsgo-darwin-arm64

Mode: Type Check (noEmit)
-------------------------

All examples type-check successfully!
No errors -- stable/mutator/invalidates narrowing works.
```

**Zero errors across all 8 example files.**

## Examples

### Signals

| File | Description |
|------|-------------|
| `01-signal-narrowing.ts` | `createSignal` with `stable` narrowing: undefined checks, discriminated unions, exhaustive switch, typeof guards, multiple independent signals |
| `02-signal-mutator.ts` | `mutator`/`invalidates` in action: setter calls reset narrowing, post-call narrowing from argument types, independent signal tracking |

### Memos

| File | Description |
|------|-------------|
| `03-memo-derived.ts` | `createMemo` returns `Accessor<T>` (stable): cached derived values, memo chains, aggregated state |
| `04-memo-caching.ts` | Memo caching patterns: discriminated union narrowing, data transforms, iterable narrowing |

### Stores

| File | Description |
|------|-------------|
| `05-store-basics.ts` | Store concepts from SolidJS docs: property access (already narrowed by TS), `createMemo` bridge to stable accessors |
| `06-store-keyed-bridge.ts` | `StoreAccessor`/`StoreWriter` bridge pattern with `stable[key]` and `invalidates get[key]` for per-property narrowing |
| `07-store-produce.ts` | `produce`/`reconcile` utilities as `mutator` functions, combining with stable memos |

### Combined

| File | Description |
|------|-------------|
| `08-all-patterns.ts` | Full application scenario: auth state signals + derived memos + store bridge, all patterns working together |

## How `stable`/`mutator`/`invalidates` Works

### `stable` -- Idempotent reads

A `stable` function returns the same value on repeated calls (absent mutation). The compiler preserves narrowing across calls:

```ts
type Accessor<T> = stable () => T;

const [count] = createSignal<number | undefined>(0);

if (count() !== undefined) {
    count().toFixed(2);  // narrowed to number -- works!
}
// Without stable: count().toFixed(2) would error -- "might be undefined"
```

### `mutator` + `invalidates` -- Targeted reset

A `mutator` resets narrowing. `invalidates` specifies exactly which stable endpoints are affected:

```ts
type Signal<T> = [
    get: Accessor<T>,
    set: mutator Setter<T> invalidates get
];

const [count, setCount] = createSignal<number | undefined>(0);

if (count() !== undefined) {
    setCount(42);              // invalidates count's read
    const n: number = count(); // post-call narrowed to number (from arg: 42)
}
```

### `stable[key]` -- Per-key tracking

For Map-like or store-like access, narrowing is tracked per argument value:

```ts
interface StoreAccessor<T> {
    stable[key] get<K extends keyof T & string>(key: K): T[K];
}
interface StoreWriter<T> {
    mutator set<K extends keyof T & string>(key: K, value: T[K]): void invalidates get[key];
}
// set("count", 99) does NOT invalidate get("user")
```

## Declaration Emit

Run with `--declaration-emit` to verify syntax is preserved in `.d.ts` output:

```bash
./run.sh --declaration-emit
```

The output `.d.ts` files contain `stable`, `mutator`, `invalidates`, and `stable[key]` exactly as authored.

## SolidJS Integration

The examples import from **real SolidJS types** at `types/solid-js/`, extracted from the [kbrilla/solid](https://github.com/kbrilla/solid/tree/stable-mutator-demo) fork. The tsconfig uses `paths` to resolve `"solid-js"` to these local type files.

**Only 2 lines changed in SolidJS's type definitions:**

```diff
-export type Accessor<T> = () => T;
+export type Accessor<T> = stable () => T;

-export type Signal<T> = [get: Accessor<T>, set: Setter<T>];
+export type Signal<T> = [get: Accessor<T>, set: mutator Setter<T> invalidates get];
```

That's it. All existing SolidJS code continues to work. `createSignal`, `createMemo`, `createEffect`, `batch`, and `untrack` all just work -- narrowing is automatically enabled through the `Accessor<T>` return type.

### Why Stores Use a Bridge Pattern

SolidJS stores use **property access** (`store.user`), not function calls. TypeScript already narrows properties natively, so `stable` isn't needed for direct store access.

However, when you need **function-based access** (e.g., keyed retrieval, per-field invalidation), the `StoreAccessor`/`StoreWriter` bridge pattern (examples 06-08) wraps store access in `stable[key]` methods, enabling per-key narrowing and targeted invalidation.

## Building From Source

```bash
git clone https://github.com/kbrilla/typescript-go.git
cd typescript-go
git checkout stable-modifier
npx hereby build
```

Cross-compile:

```bash
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -tags='noembed,noassert' -o tsgo-darwin-arm64 ./cmd/tsgo
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -tags='noembed,noassert' -o tsgo-linux-amd64 ./cmd/tsgo
```

## Platform Support

| Platform | Architecture | Binary |
|----------|-------------|--------|
| macOS | Apple Silicon (M1/M2/M3/M4) | `tsgo-darwin-arm64` |
| Linux | x86_64 | `tsgo-linux-amd64` |

Build from source for other platforms (macOS Intel, Linux ARM64, Windows).

## Links

- **TypeScript-Go PR**: [kbrilla/typescript-go pull/2](https://github.com/kbrilla/typescript-go/pull/2)
- **SolidJS Fork**: [kbrilla/solid (stable-mutator-demo)](https://github.com/kbrilla/solid/tree/stable-mutator-demo)
- **Demo Repo**: [kbrilla/solidjs-stable-mutator-demo](https://github.com/kbrilla/solidjs-stable-mutator-demo)

## License

The `tsgo` binaries are built from [TypeScript-Go](https://github.com/microsoft/TypeScript-go) and are subject to its license terms. Example files are provided for demonstration purposes.
