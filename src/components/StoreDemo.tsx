import { createSignal, createMemo, Show, For } from "solid-js";
import { createStore, produce } from "solid-js/store";

interface User {
  id: number;
  username: string;
  location: string;
  loggedIn: boolean;
}

interface AppStore {
  userCount: number;
  users: User[];
  filter: "all" | "loggedIn" | "loggedOut";
}

type ConnectionStatus =
  | { status: "disconnected" }
  | { status: "connecting"; attempt: number }
  | { status: "connected"; latency: number }
  | { status: "error"; reason: string };

interface Notification {
  id: number;
  type: "info" | "warning" | "error";
  message: string;
  read: boolean;
}

interface AdvancedStore {
  currentUser: { name: string; role: "admin" | "user" | "guest" } | null;
  theme: "light" | "dark";
  notifications: Notification[];
  connection: ConnectionStatus;
}

export default function StoreDemo() {
  const [store, setStore] = createStore<AppStore>({
    userCount: 3,
    users: [
      { id: 0, username: "felix909", location: "England", loggedIn: false },
      { id: 1, username: "tracy634", location: "Canada", loggedIn: true },
      { id: 2, username: "johny123", location: "India", loggedIn: true },
    ],
    filter: "all",
  });

  // Memo bridging store to stable accessor
  const filteredUsers = createMemo(() => {
    switch (store.filter) {
      case "all": return store.users;
      case "loggedIn": return store.users.filter((u) => u.loggedIn);
      case "loggedOut": return store.users.filter((u) => !u.loggedIn);
    }
  });

  const filteredCount = createMemo(() => filteredUsers().length);

  const [newUsername, setNewUsername] = createSignal("");
  const [newLocation, setNewLocation] = createSignal("");

  // Advanced store for narrowing demos
  const [adv, setAdv] = createStore<AdvancedStore>({
    currentUser: { name: "Alice", role: "admin" },
    theme: "dark",
    notifications: [
      { id: 1, type: "info", message: "Welcome back!", read: false },
      { id: 2, type: "warning", message: "Storage almost full", read: false },
      { id: 3, type: "error", message: "Sync failed", read: true },
    ],
    connection: { status: "connected", latency: 42 },
  });

  // Memos bridge store fields to stable accessors
  const currentUser = createMemo(() => adv.currentUser);
  const connection = createMemo(() => adv.connection);
  const unreadNotifications = createMemo(() => adv.notifications.filter(n => !n.read));
  const unreadCount = createMemo(() => unreadNotifications().length);

  // Exhaustive switch using stable memo over store field
  function getConnectionInfo(): string {
    switch (connection().status) {
      case "disconnected": return "Offline";
      case "connecting": return `Connecting (attempt ${(connection() as { status: "connecting"; attempt: number }).attempt})`;
      case "connected": return `Online (${(connection() as { status: "connected"; latency: number }).latency}ms)`;
      case "error": return `Error: ${(connection() as { status: "error"; reason: string }).reason}`;
    }
  }

  return (
    <>
      <h2>Stores</h2>
      <p class="subtitle">
        Stores use property access (already narrowable). Memos bridge store reads to <span class="badge stable">stable</span> accessors.
      </p>

      <div class="demo-section">
        <h3>Store State</h3>
        <div class="demo-row">
          <span>userCount:</span>
          <span class="value">{store.userCount}</span>
          <span>filter:</span>
          <span class="value">{store.filter}</span>
          <span>showing:</span>
          <span class="value">{filteredCount()}</span>
        </div>
        <div class="demo-row">
          <button onClick={() => setStore("filter", "all")} class={store.filter === "all" ? "success" : ""}>
            All
          </button>
          <button onClick={() => setStore("filter", "loggedIn")} class={store.filter === "loggedIn" ? "success" : ""}>
            Logged In
          </button>
          <button onClick={() => setStore("filter", "loggedOut")} class={store.filter === "loggedOut" ? "success" : ""}>
            Logged Out
          </button>
        </div>
      </div>

      <div class="demo-section">
        <h3>Users</h3>
        <div class="user-list">
          <For each={filteredUsers()}>
            {(user) => (
              <div class="user-card">
                <div class="demo-row">
                  <span style={{ "min-width": "100px" }}>{user.username}</span>
                  <span class="type-info">{user.location}</span>
                  <span class={`narrowing-status ${user.loggedIn ? "narrowed" : "not-narrowed"}`}>
                    {user.loggedIn ? "online" : "offline"}
                  </span>
                  <button
                    onClick={() =>
                      setStore(
                        "users",
                        (u) => u.id === user.id,
                        "loggedIn",
                        (v) => !v
                      )
                    }
                  >
                    Toggle Login
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="demo-section">
        <h3>Add User</h3>
        <div class="demo-row">
          <input
            type="text"
            value={newUsername()}
            onInput={(e) => setNewUsername(e.currentTarget.value)}
            placeholder="Username"
          />
          <input
            type="text"
            value={newLocation()}
            onInput={(e) => setNewLocation(e.currentTarget.value)}
            placeholder="Location"
          />
          <button
            class="success"
            onClick={() => {
              if (newUsername() && newLocation()) {
                setStore(
                  produce((s) => {
                    s.users.push({
                      id: s.users.length,
                      username: newUsername(),
                      location: newLocation(),
                      loggedIn: false,
                    });
                    s.userCount = s.users.length;
                  })
                );
                setNewUsername("");
                setNewLocation("");
              }
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div class="demo-section">
        <h3>Path Syntax Updates</h3>
        <div class="demo-row">
          <button
            onClick={() =>
              setStore(
                "users",
                { from: 0, to: store.users.length },
                "loggedIn",
                true
              )
            }
            class="success"
          >
            Login All
          </button>
          <button
            onClick={() =>
              setStore(
                "users",
                { from: 0, to: store.users.length },
                "loggedIn",
                false
              )
            }
            class="danger"
          >
            Logout All
          </button>
          <button
            onClick={() =>
              setStore("users", (users) =>
                users.filter((u) => u.loggedIn)
              )
            }
          >
            Remove Logged Out
          </button>
        </div>
        <div class="code-block">
{`// Store path syntax from SolidJS docs:
setStore("users", { from: 0, to: users.length }, "loggedIn", true);

// produce utility for batch mutations
setStore(produce((s) => {
  s.users.push({ id: 3, username: "new", location: "US", loggedIn: false });
  s.userCount = s.users.length;
}));

// Memo bridges store to stable accessor
const filtered = createMemo(() => store.users.filter(u => u.loggedIn));
if (filtered().length > 0) {
  filtered()[0].username;  // OK - stable memo narrowing
}`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Memo-Bridged Store Narrowing</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          Wrap store fields in createMemo for <span class="badge stable">stable</span> narrowing on deep state
        </p>
        <div class="demo-row">
          <span>currentUser():</span>
          <span class="value">
            {currentUser() !== null
              ? `${currentUser()!.name} (${currentUser()!.role})`
              : "null"}
          </span>
          <Show when={currentUser() !== null}>
            <span class="narrowing-status narrowed">narrowed — .name, .role available</span>
          </Show>
          <Show when={currentUser() === null}>
            <span class="narrowing-status not-narrowed">null — no properties</span>
          </Show>
        </div>
        <div class="demo-row">
          <span>connection().status:</span>
          <span class="value">{connection().status}</span>
          <span>info:</span>
          <span class="value">{getConnectionInfo()}</span>
        </div>
        <div class="demo-row">
          <span>unreadCount():</span>
          <span class="value">{unreadCount()}</span>
          <Show when={unreadCount() > 0}>
            <span class="narrowing-status narrowed">
              {unreadCount()} unread: [{unreadNotifications().map(n => n.message).join(", ")}]
            </span>
          </Show>
          <Show when={unreadCount() === 0}>
            <span class="narrowing-status not-narrowed">all read</span>
          </Show>
        </div>
        <div class="demo-row">
          <button onClick={() => setAdv("currentUser", { name: "Alice", role: "admin" })} class="success">
            Set Admin
          </button>
          <button onClick={() => setAdv("currentUser", { name: "Bob", role: "user" })}>
            Set User
          </button>
          <button onClick={() => setAdv("currentUser", null)} class="danger">
            Set Null
          </button>
        </div>
        <div class="code-block">
{`// Memo bridges store field to stable accessor:
const currentUser = createMemo(() => adv.currentUser);
const connection = createMemo(() => adv.connection);
const unreadNotifications = createMemo(() =>
  adv.notifications.filter(n => !n.read)
);
const unreadCount = createMemo(() => unreadNotifications().length);

// Null check narrows through stable memo:
if (currentUser() !== null) {
  currentUser().name;   // OK - narrowed to { name; role }
  currentUser().role;   // OK - still narrowed
}
// Memo chain: unreadCount narrows through unreadNotifications`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Exhaustive Switch on Store Field</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          4-variant discriminated union via <span class="badge stable">stable</span> memo over store
        </p>
        <div class="demo-row">
          <span>connection().status:</span>
          <span class="value">{connection().status}</span>
          <span class="type-info">
            <Show when={connection().status === "disconnected"}>
              type: {'{ status: "disconnected" }'}
            </Show>
            <Show when={connection().status === "connecting"}>
              type: {'{ status: "connecting"; attempt: number }'}
            </Show>
            <Show when={connection().status === "connected"}>
              type: {'{ status: "connected"; latency: number }'}
            </Show>
            <Show when={connection().status === "error"}>
              type: {'{ status: "error"; reason: string }'}
            </Show>
          </span>
        </div>
        <div class="demo-row">
          <button onClick={() => setAdv("connection", { status: "disconnected" })}>
            Disconnected
          </button>
          <button onClick={() => setAdv("connection", { status: "connecting", attempt: 1 })}>
            Connecting
          </button>
          <button onClick={() => setAdv("connection", { status: "connected", latency: 42 })} class="success">
            Connected
          </button>
          <button onClick={() => setAdv("connection", { status: "error", reason: "Network timeout" })} class="danger">
            Error
          </button>
        </div>
        <div class="code-block">
{`// Exhaustive switch on stable memo over store field:
function getConnectionInfo(): string {
  switch (connection().status) {
    case "disconnected":
      return "Offline";
    case "connecting":
      return \`Attempt \${connection().attempt}\`;  // narrowed
    case "connected":
      return \`Latency: \${connection().latency}ms\`; // narrowed
    case "error":
      return \`Error: \${connection().reason}\`;     // narrowed
  }
  // Exhaustive — all 4 variants handled
}`}
        </div>
      </div>

      <div class="demo-section">
        <h3>Independent Store Memos</h3>
        <p class="subtitle" style={{ "margin-bottom": "0.75rem" }}>
          Narrowing one <span class="badge stable">stable</span> memo doesn’t affect another
        </p>
        <div class="demo-row">
          <span>currentUser():</span>
          <span class="value">
            {currentUser() !== null ? currentUser()!.name : "null"}
          </span>
          <span>connection().status:</span>
          <span class="value">{connection().status}</span>
        </div>
        <div class="demo-row">
          <Show when={currentUser() !== null && connection().status === "connected"}>
            <span class="narrowing-status narrowed">
              Both narrowed independently — user: {currentUser()!.name}, latency: {(connection() as { status: "connected"; latency: number }).latency}ms
            </span>
          </Show>
          <Show when={currentUser() === null || connection().status !== "connected"}>
            <span class="narrowing-status not-narrowed">
              {currentUser() === null ? "user is null" : ""}
              {currentUser() === null && connection().status !== "connected" ? " & " : ""}
              {connection().status !== "connected" ? `connection is ${connection().status}` : ""}
            </span>
          </Show>
        </div>
        <div class="demo-row">
          <button onClick={() => {
            setAdv("currentUser", { name: "Alice", role: "admin" });
            setAdv("connection", { status: "connected", latency: 15 });
          }} class="success">
            Both Valid
          </button>
          <button onClick={() => {
            setAdv("currentUser", null);
            setAdv("connection", { status: "error", reason: "Timeout" });
          }} class="danger">
            Both Invalid
          </button>
          <button onClick={() => {
            setAdv("currentUser", { name: "Charlie", role: "guest" });
            setAdv("connection", { status: "disconnected" });
          }}>
            User Valid, Connection Off
          </button>
        </div>
        <div class="demo-row">
          <button onClick={() => setAdv(produce((s) => {
            s.notifications.forEach(n => { n.read = false; });
          }))}>
            Mark All Unread
          </button>
          <button onClick={() => setAdv(produce((s) => {
            s.notifications.forEach(n => { n.read = true; });
          }))} class="success">
            Mark All Read
          </button>
        </div>
        <div class="code-block">
{`// Independent narrowing — stable memos narrow separately:
if (currentUser() !== null && connection().status === "connected") {
  currentUser().name;       // narrowed to { name; role }
  connection().latency;     // narrowed to { status: "connected"; latency }
  // Each memo narrows independently
  // Invalidating one doesn’t affect the other’s narrowing
}`}
        </div>
      </div>
    </>
  );
}
