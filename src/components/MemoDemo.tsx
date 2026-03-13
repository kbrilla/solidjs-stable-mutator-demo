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

interface ApiUser {
  name: string;
  email: string;
}

type ApiResponse =
  | { ok: true; data: { users: ApiUser[]; total: number } }
  | { ok: false; error: { code: number; message: string } };

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

  // typeof guard memo — returns string | number | boolean based on count
  const mixedMemo = createMemo<string | number | boolean>(() => {
    if (count() > 10) return "big";
    if (count() < 0) return false;
    return count();
  });

  // Memo chain with API response — progressive narrowing
  const [rawResponse, setRawResponse] = createSignal<ApiResponse | null>(null);
  const apiResponse = createMemo(() => rawResponse());
  const responseData = createMemo(() => {
    const r = apiResponse();
    if (r !== null && r.ok) return r.data;
    return null;
  });
  const userNames = createMemo(() => {
    const d = responseData();
    return d !== null ? d.users.map(u => u.name) : [];
  });

  // instanceof narrowing demo
  const [resultVal, setResultVal] = createSignal<Error | string>("ok");
  const resultMemo = createMemo(() => resultVal());

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

      <div class="demo-section">
        <h3>typeof Guard Chain on Memo</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          typeof narrowing on <span class="badge stable">stable</span> memo — chains through string / number / boolean
        </p>
        <div class="demo-row">
          <span>count():</span>
          <span class="value">{count()}</span>
          <span>mixedMemo():</span>
          <span class="value">{String(mixedMemo())}</span>
          <span class="type-info">typeof: {typeof mixedMemo()}</span>
        </div>
        <div class="demo-row">
          <Show when={typeof mixedMemo() === "string"}>
            <span class="narrowing-status narrowed">
              string → .toUpperCase() = "{(mixedMemo() as string).toUpperCase()}"
            </span>
          </Show>
          <Show when={typeof mixedMemo() === "number"}>
            <span class="narrowing-status narrowed">
              number → .toFixed(2) = {(mixedMemo() as number).toFixed(2)}
            </span>
          </Show>
          <Show when={typeof mixedMemo() === "boolean"}>
            <span class="narrowing-status narrowed">
              boolean → !val = {String(!(mixedMemo() as boolean))}
            </span>
          </Show>
        </div>
        <div class="demo-row">
          <span class="type-info">count &gt; 10 → "big" | count &lt; 0 → false | else → count</span>
        </div>
        <div class="demo-row">
          <button onClick={() => setCount(15)}>Set count = 15 (→ "big")</button>
          <button onClick={() => setCount(-5)}>Set count = -5 (→ false)</button>
          <button onClick={() => setCount(7)}>Set count = 7 (→ 7)</button>
        </div>
        <div class="code-block">
{`// typeof narrowing chain on stable memo:
const mixedMemo = createMemo<string | number | boolean>(() => ...);

if (typeof mixedMemo() === "string") {
  mixedMemo().toUpperCase();  // OK - narrowed to string
  mixedMemo().charAt(0);      // OK - still string
}
if (typeof mixedMemo() === "number") {
  mixedMemo().toFixed(2);     // OK - narrowed to number
  mixedMemo() + 1;            // OK - still number
}
if (typeof mixedMemo() === "boolean") {
  !mixedMemo();               // OK - narrowed to boolean
}`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Memo Chain with Progressive Narrowing</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          Chain of <span class="badge stable">stable</span> memos — each level narrows the previous result
        </p>
        <div class="demo-row">
          <span>apiResponse():</span>
          <span class="value">
            {apiResponse() === null ? "null" : (apiResponse() as ApiResponse).ok ? "ok: true" : "ok: false"}
          </span>
        </div>
        <div class="demo-row">
          <span>responseData():</span>
          <span class="value">
            {responseData() !== null
              ? `{ users: [${responseData()!.users.map(u => u.name).join(", ")}], total: ${responseData()!.total} }`
              : "null"}
          </span>
        </div>
        <div class="demo-row">
          <span>userNames():</span>
          <span class="value">{userNames().length > 0 ? `[${userNames().join(", ")}]` : "[]"}</span>
          <Show when={responseData() !== null}>
            <span class="narrowing-status narrowed">chain narrowed through 3 memos</span>
          </Show>
          <Show when={responseData() === null}>
            <span class="narrowing-status not-narrowed">no data yet</span>
          </Show>
        </div>
        <div class="demo-row">
          <button onClick={() => setRawResponse({
            ok: true,
            data: {
              users: [
                { name: "Alice", email: "alice@example.com" },
                { name: "Bob", email: "bob@example.com" },
              ],
              total: 2,
            },
          })} class="success">
            Set Success Response
          </button>
          <button onClick={() => setRawResponse({
            ok: false,
            error: { code: 404, message: "Not Found" },
          })} class="danger">
            Set Error Response
          </button>
          <button onClick={() => setRawResponse(null)}>Set Null</button>
        </div>
        <div class="code-block">
{`// Progressive narrowing through memo chain:
type ApiResponse =
  | { ok: true; data: { users: ApiUser[]; total: number } }
  | { ok: false; error: { code: number; message: string } };

const response = createMemo(() => rawResponse());
const responseData = createMemo(() => {
  const r = response();
  if (r !== null && r.ok) return r.data;  // narrowed via stable
  return null;
});
const userNames = createMemo(() => {
  const d = responseData();
  return d !== null ? d.users.map(u => u.name) : [];  // narrowed
});
// Each memo narrows further — all stable, all narrowable`}
        </div>
      </div>

      <div class="demo-section">
        <h3>instanceof Narrowing on Memo</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          instanceof checks narrow <span class="badge stable">stable</span> memos to class instances
        </p>
        <div class="demo-row">
          <span>resultMemo():</span>
          <span class="value">
            {resultMemo() instanceof Error
              ? `Error: ${(resultMemo() as Error).message}`
              : String(resultMemo())}
          </span>
          <Show when={resultMemo() instanceof Error}>
            <span class="narrowing-status narrowed">
              narrowed to Error — .message, .stack available
            </span>
          </Show>
          <Show when={!(resultMemo() instanceof Error)}>
            <span class="narrowing-status not-narrowed">string — no Error properties</span>
          </Show>
        </div>
        <div class="demo-row">
          <button onClick={() => setResultVal("everything is fine")} class="success">Set String</button>
          <button onClick={() => setResultVal(new Error("Something went wrong"))} class="danger">
            Set Error
          </button>
          <button onClick={() => setResultVal(new Error("Network timeout"))}>
            Set Network Error
          </button>
        </div>
        <div class="code-block">
{`// instanceof narrowing persists on stable memo:
const resultMemo = createMemo(() => result());

if (resultMemo() instanceof Error) {
  resultMemo().message;  // OK - narrowed to Error
  resultMemo().stack;    // OK - still Error
  resultMemo().name;     // OK - still Error
} else {
  resultMemo().toUpperCase();  // OK - narrowed to string
  resultMemo().length;         // OK - still string
}`}
        </div>
      </div>
    </>
  );
}
