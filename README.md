# SolidJS x TypeScript-Go: stable/mutator/invalidates Demo

A **runnable** SolidJS application demonstrating how the `stable`, `mutator`, and `invalidates` type modifiers enable sound narrowing for reactive primitives.

## What This Is

This demo shows how a 2-line patch to SolidJS's type definitions — adding `stable` to `Accessor<T>` and `mutator ... invalidates` to `Signal<T>` — unlocks **cross-call narrowing** that TypeScript normally rejects for function return values.

With these modifiers, **tsgo** (the TypeScript-Go native compiler) understands that:

- **`stable`** — `Accessor<T>` always returns the same value within a narrowing scope (no external mutation can change it between calls)
- **`mutator`** — `Setter<T>` is the only way to change the signal's value
- **`invalidates`** — calling the setter invalidates prior narrowing of the getter, then re-narrows from the argument type

## Quick Start

```bash
git clone https://github.com/kbrilla/solidjs-stable-mutator-demo.git
cd solidjs-stable-mutator-demo
npm install    # also patches solid-js types via postinstall
npm run dev    # starts Vite dev server on http://localhost:3000
```

## Type Checking with tsgo

```bash
./run.sh
```

This runs the bundled `tsgo` binary (TypeScript-Go with stable/mutator support) against the project. It should report zero errors.

## How It Works

The entire integration is a **2-line type patch** applied to `node_modules/solid-js/types/reactive/signal.d.ts` (via `postinstall`):

```diff
- export type Accessor<T> = () => T;
+ export type Accessor<T> = stable () => T;

- export type Signal<T> = [get: Accessor<T>, set: Setter<T>];
+ export type Signal<T> = [get: Accessor<T>, set: mutator Setter<T> invalidates get];
```

That's it. No runtime changes, no new APIs, no breaking changes.

## Demo Sections

### Signals
- **Nullable narrowing** — `if (count() !== undefined)` narrows all subsequent `count()` calls
- **Discriminated unions** — `state().status === "success"` narrows `state().data`
- **Independent signals** — `name()` and `age()` narrow independently
- **Mutator invalidation** — `setCount(42)` invalidates prior narrowing, then re-narrows from the argument

### Memos
- **Basic memo** — `createMemo` returns `stable Accessor<T>`, so memos are narrowable
- **Nullable memo** — `fullName()` narrows to `string` after null check
- **Discriminated union memo** — fetch result memo with status narrowing
- **Memo chains** — `activeUsers()` and `activeCount()` chain stable accessors

### Stores
- **Store state** — stores use property access (already narrowable in TypeScript)
- **Filtered views** — `createMemo` bridges store reads to stable accessors
- **Path syntax** — SolidJS store path updates with filtering
- **Batch mutations** — `produce()` for store batch updates

## Links

- [TypeScript-Go PR](https://github.com/kbrilla/typescript-go/pull/2) — implementation of stable/mutator/invalidates
- [SolidJS Fork](https://github.com/kbrilla/solid/tree/stable-mutator-demo) — patched solid-js type tests
- [This Repo](https://github.com/kbrilla/solidjs-stable-mutator-demo) — this demo application
- [TC39 Proposal](https://github.com/nicolo-ribaudo/tc39-proposal-stable-callable) — stable callable proposal

## Tech Stack

- [SolidJS](https://www.solidjs.com/) v1.9 — reactive UI framework
- [Vite](https://vitejs.dev/) v7 — build tool
- [TypeScript-Go (tsgo)](https://github.com/nicolo-ribaudo/TypeScript/tree/stable) — native TypeScript compiler with stable/mutator support
