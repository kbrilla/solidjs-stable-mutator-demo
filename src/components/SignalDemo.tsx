import { createSignal, Show } from "solid-js";

type AppState =
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; message: string };

export default function SignalDemo() {
  // Basic nullable signal
  const [count, setCount] = createSignal<number | undefined>(0);

  // Discriminated union signal
  const [state, setState] = createSignal<AppState>({ status: "loading" });

  // Multiple signals
  const [name, setName] = createSignal<string | null>("Alice");
  const [age, setAge] = createSignal<number | null>(30);

  return (
    <>
      <h2>Signal Narrowing</h2>
      <p class="subtitle">
        <span class="badge stable">stable</span> on Accessor&lt;T&gt; preserves narrowing across repeated calls
      </p>

      <div class="demo-section">
        <h3>Nullable Signal</h3>
        <div class="demo-row">
          <span>count():</span>
          <span class="value">{count() !== undefined ? count() : "undefined"}</span>
          <span class="type-info">
            {count() !== undefined ? "narrowed to number" : "number | undefined"}
          </span>
        </div>
        <div class="demo-row">
          <button onClick={() => setCount((c) => (c ?? 0) + 1)}>Increment</button>
          <button onClick={() => setCount(undefined)} class="danger">Set Undefined</button>
          <button onClick={() => setCount(0)}>Reset to 0</button>
        </div>
        <div class="code-block">
{`// With stable Accessor, tsgo preserves narrowing:
if (count() !== undefined) {
  count().toFixed(2);       // OK - narrowed to number
  const n: number = count(); // OK - still narrowed
}
// Without stable, tsc would error on the second count() call`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Discriminated Union</h3>
        <div class="demo-row">
          <span>state().status:</span>
          <span class="value">{state().status}</span>
          <Show when={state().status === "success"}>
            <span class="type-info">
              data: {(state() as { status: "success"; data: string }).data}
            </span>
          </Show>
          <Show when={state().status === "error"}>
            <span class="type-info" style={{ color: "#f87171" }}>
              error: {(state() as { status: "error"; message: string }).message}
            </span>
          </Show>
        </div>
        <div class="demo-row">
          <button onClick={() => setState({ status: "loading" })}>Loading</button>
          <button onClick={() => setState({ status: "success", data: "Hello World" })} class="success">
            Success
          </button>
          <button onClick={() => setState({ status: "error", message: "Oops" })} class="danger">
            Error
          </button>
        </div>
        <div class="code-block">
{`// Discriminated union narrowing persists across calls:
if (state().status === "success") {
  state().data.toUpperCase();     // OK - narrowed to success
}
switch (state().status) {
  case "success": state().data;   // OK - narrowed
  case "error": state().message;  // OK - narrowed
}`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Multiple Independent Signals</h3>
        <div class="demo-row">
          <span>name():</span>
          <span class="value">{name() ?? "null"}</span>
          <span>age():</span>
          <span class="value">{age() ?? "null"}</span>
        </div>
        <div class="demo-row">
          <Show when={name() !== null && age() !== null}>
            <span class="narrowing-status narrowed">
              Both narrowed independently
            </span>
          </Show>
          <Show when={name() === null || age() === null}>
            <span class="narrowing-status not-narrowed">
              One or both are null
            </span>
          </Show>
        </div>
        <div class="demo-row">
          <button onClick={() => setName(name() === null ? "Alice" : null)}>
            Toggle Name
          </button>
          <button onClick={() => setAge(age() === null ? 30 : null)}>
            Toggle Age
          </button>
        </div>
        <div class="code-block">
{`// Independent signals narrow independently:
if (name() !== null && age() !== null) {
  const n: string = name();  // OK - narrowed
  const a: number = age();   // OK - narrowed independently
}`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Mutator Invalidation</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          <span class="badge mutator">mutator</span>{" "}
          <span class="badge invalidates">invalidates</span> — calling the setter resets narrowing, then post-call narrows from the argument
        </p>
        <div class="demo-row">
          <span>count():</span>
          <span class="value">{count() !== undefined ? count().toFixed(2) : "undefined"}</span>
        </div>
        <div class="code-block">
{`if (count() !== undefined) {
  const n: number = count();      // OK - narrowed
  setCount(42);                   // mutator call -> invalidates
  // Post-call narrowing: narrowed to number (from arg 42)
  const a: number = count();      // OK - re-narrowed

  setCount(undefined);            // mutator call -> invalidates
  // Post-call narrowing: narrowed to undefined
  const b: undefined = count();   // OK - re-narrowed
}`}
        </div>
      </div>
    </>
  );
}
