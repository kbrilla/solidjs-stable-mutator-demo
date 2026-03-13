import { createSignal, createMemo, Show, For } from "solid-js";

type FetchResult =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: string };

interface User {
  name: string;
  active: boolean;
}

export default function MemoDemo() {
  // Basic memo
  const [count, setCount] = createSignal(0);
  const isEven = createMemo(() => count() % 2 === 0);
  const doubled = createMemo(() => count() * 2);

  // Nullable memo
  const [firstName, setFirstName] = createSignal<string | null>("John");
  const [lastName, setLastName] = createSignal<string | null>("Doe");
  const fullName = createMemo(() => {
    const f = firstName();
    const l = lastName();
    if (f === null || l === null) return null;
    return `${f} ${l}`;
  });

  // Fetch result memo (discriminated union)
  const [response, setResponse] = createSignal<FetchResult>({ status: "idle" });
  const displayText = createMemo(() => {
    const r = response();
    switch (r.status) {
      case "idle": return "Ready to fetch";
      case "loading": return "Loading...";
      case "success": return r.data;
      case "error": return `Error: ${r.error}`;
    }
  });

  // User list with memo
  const [users, setUsers] = createSignal<User[]>([
    { name: "Alice", active: true },
    { name: "Bob", active: false },
    { name: "Charlie", active: true },
  ]);
  const activeUsers = createMemo(() => users().filter((u) => u.active));
  const activeCount = createMemo(() => activeUsers().length);

  return (
    <>
      <h2>Derived Values with Memos</h2>
      <p class="subtitle">
        createMemo returns <span class="badge stable">stable</span> Accessor&lt;T&gt; — cached and narrowable
      </p>

      <div class="demo-section">
        <h3>Basic Memo</h3>
        <div class="demo-row">
          <span>count():</span>
          <span class="value">{count()}</span>
          <span>doubled():</span>
          <span class="value">{doubled()}</span>
          <span>isEven():</span>
          <span class="value">{isEven() ? "true" : "false"}</span>
        </div>
        <div class="demo-row">
          <button onClick={() => setCount((c) => c + 1)}>Increment</button>
          <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
          <button onClick={() => setCount(0)}>Reset</button>
        </div>
        <div class="code-block">
{`// createMemo returns Accessor<T> which is stable () => T
const doubled = createMemo(() => count() * 2);
// doubled() is stable - repeated reads are narrowed
if (typeof doubled() === "number") {
  doubled().toFixed(2);  // OK - stable memo`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Nullable Memo (Full Name)</h3>
        <div class="demo-row">
          <span>fullName():</span>
          <span class="value">{fullName() ?? "null"}</span>
          <Show when={fullName() !== null}>
            <span class="narrowing-status narrowed">narrowed to string</span>
          </Show>
          <Show when={fullName() === null}>
            <span class="narrowing-status not-narrowed">null</span>
          </Show>
        </div>
        <div class="demo-row">
          <input
            type="text"
            value={firstName() ?? ""}
            onInput={(e) => setFirstName(e.currentTarget.value || null)}
            placeholder="First name"
          />
          <input
            type="text"
            value={lastName() ?? ""}
            onInput={(e) => setLastName(e.currentTarget.value || null)}
            placeholder="Last name"
          />
          <button onClick={() => { setFirstName(null); setLastName(null); }} class="danger">
            Clear
          </button>
        </div>
        <div class="code-block">
{`// Memo with nullable result - stable narrowing
const fullName = createMemo(() => {
  const f = firstName();
  const l = lastName();
  return f && l ? \`\${f} \${l}\` : null;
});
if (fullName() !== null) {
  fullName().toUpperCase();  // OK - stable narrowing
  fullName().split(" ");     // OK - still narrowed
}`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Fetch Result (Discriminated Union Memo)</h3>
        <div class="demo-row">
          <span>status:</span>
          <span class="value">{response().status}</span>
          <span>display:</span>
          <span class="value">{displayText()}</span>
        </div>
        <div class="demo-row">
          <button onClick={() => setResponse({ status: "idle" })}>Idle</button>
          <button onClick={() => {
            setResponse({ status: "loading" });
            setTimeout(() => setResponse({ status: "success", data: "Fetched data at " + new Date().toLocaleTimeString() }), 1000);
          }}>
            Simulate Fetch
          </button>
          <button onClick={() => setResponse({ status: "error", error: "Network timeout" })} class="danger">
            Simulate Error
          </button>
        </div>
      </div>

      <div class="demo-section">
        <h3>Active Users (Memo Chain)</h3>
        <div class="demo-row">
          <span>Total: {users().length}</span>
          <span>Active: {activeCount()}</span>
        </div>
        <div class="user-list">
          <For each={users()}>
            {(user, i) => (
              <div class="user-card">
                <div class="demo-row">
                  <span>{user.name}</span>
                  <span class={`narrowing-status ${user.active ? "narrowed" : "not-narrowed"}`}>
                    {user.active ? "active" : "inactive"}
                  </span>
                  <button
                    onClick={() =>
                      setUsers((prev) =>
                        prev.map((u, idx) =>
                          idx === i() ? { ...u, active: !u.active } : u
                        )
                      )
                    }
                  >
                    Toggle
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
        <div class="demo-row">
          <button onClick={() => setUsers((prev) => [...prev, { name: `User ${prev.length + 1}`, active: true }])} class="success">
            Add User
          </button>
        </div>
        <div class="code-block">
{`// Memo chain - each returns stable Accessor<T>
const activeUsers = createMemo(() => users().filter(u => u.active));
const activeCount = createMemo(() => activeUsers().length);
// activeUsers() is stable - the filtered array stays narrowed
const first = activeUsers()[0];
if (first) first.name.toUpperCase();  // OK`}
        </div>
      </div>
    </>
  );
}
