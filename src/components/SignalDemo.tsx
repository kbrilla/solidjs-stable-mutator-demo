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

  // typeof guard demo
  const [input, setInput] = createSignal<string | number>("hello");

  // Array signal for null guard + method chain demo
  const [items, setItems] = createSignal<string[] | null>(["apple", "banana", "cherry"]);

  // Exhaustive switch using stable signal
  function getStatusMessage(): string {
    switch (state().status) {
      case "loading": return "Loading...";
      case "success": return state().data;
      case "error": return state().message;
    }
  }

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

      <div class="demo-section">
        <h3>typeof Guard Narrowing</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          typeof checks narrow <span class="badge stable">stable</span> accessors across repeated calls
        </p>
        <div class="demo-row">
          <span>input():</span>
          <span class="value">{String(input())}</span>
          <span class="type-info">typeof: {typeof input()}</span>
        </div>
        <div class="demo-row">
          <Show when={typeof input() === "string"}>
            <span class="narrowing-status narrowed">
              string → .toUpperCase() = "{(input() as string).toUpperCase()}"
            </span>
          </Show>
          <Show when={typeof input() === "number"}>
            <span class="narrowing-status narrowed">
              number → .toFixed(2) = {(input() as number).toFixed(2)}
            </span>
          </Show>
        </div>
        <div class="demo-row">
          <button onClick={() => setInput("hello")}>Set "hello"</button>
          <button onClick={() => setInput(42)}>Set 42</button>
          <button onClick={() => setInput("TypeScript-Go")}>Set "TypeScript-Go"</button>
          <button onClick={() => setInput(3.14159)}>Set π</button>
        </div>
        <div class="code-block">
{`// typeof narrowing persists across multiple stable calls:
const [input, setInput] = createSignal<string | number>("hello");

if (typeof input() === "string") {
  input().toUpperCase();  // OK - narrowed to string
  input().charAt(0);      // OK - still string
  input().length;          // OK - still string
}
if (typeof input() === "number") {
  input().toFixed(2);     // OK - narrowed to number
  input() * 2;            // OK - still number
  Math.round(input());    // OK - still number
}
// Without stable, only the FIRST input() after the guard is narrowed`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Exhaustive Switch on Signal</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          switch on <span class="badge stable">stable</span> discriminated union — each case narrows properties
        </p>
        <div class="demo-row">
          <span>state().status:</span>
          <span class="value">{state().status}</span>
          <span>getStatusMessage():</span>
          <span class="value">{getStatusMessage()}</span>
        </div>
        <div class="demo-row">
          <button onClick={() => setState({ status: "loading" })}>Loading</button>
          <button onClick={() => setState({ status: "success", data: "Response OK" })} class="success">
            Success
          </button>
          <button onClick={() => setState({ status: "error", message: "Request failed" })} class="danger">
            Error
          </button>
        </div>
        <div class="code-block">
{`// Exhaustive switch — each case narrows state() fully:
function getStatusMessage(): string {
  switch (state().status) {
    case "loading":
      return "Loading...";
    case "success":
      return state().data;     // narrowed: { status: "success"; data: string }
    case "error":
      return state().message;  // narrowed: { status: "error"; message: string }
  }
  // No default needed — exhaustive with stable narrowing
}`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Null Guard with Method Chains</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          Null checks on <span class="badge stable">stable</span> signals persist through chains of method calls
        </p>
        <div class="demo-row">
          <span>items():</span>
          <span class="value">{items() !== null ? `[${items()!.join(", ")}]` : "null"}</span>
          <Show when={items() !== null}>
            <span class="narrowing-status narrowed">
              narrowed → .length = {items()!.length}, .map/.forEach available
            </span>
          </Show>
          <Show when={items() === null}>
            <span class="narrowing-status not-narrowed">null — methods unavailable</span>
          </Show>
        </div>
        <div class="demo-row">
          <button onClick={() => setItems(["apple", "banana", "cherry"])}>Set Array</button>
          <button onClick={() => setItems(null)} class="danger">Set Null</button>
          <button onClick={() => setItems(["x", "y", "z", "w", "v"])}>Set 5 Items</button>
        </div>
        <div class="code-block">
{`// Null guard persists across multiple method calls:
const [items, setItems] = createSignal<string[] | null>(["apple", "banana"]);

if (items() !== null) {
  items().length;                    // OK - narrowed to string[]
  items().map(x => x.toUpperCase()); // OK - still narrowed
  items().forEach(x => log(x));      // OK - still narrowed
  items().filter(x => x.length > 3); // OK - still narrowed
  items().join(", ");                 // OK - still narrowed
}
// Without stable, only the FIRST items() would be narrowed`}
        </div>
      </div>
    </>
  );
}
