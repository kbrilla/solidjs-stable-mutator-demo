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
    </>
  );
}
