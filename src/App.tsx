import { createSignal, For } from "solid-js";
import SignalDemo from "./components/SignalDemo";
import MemoDemo from "./components/MemoDemo";
import StoreDemo from "./components/StoreDemo";

const tabs = ["Signals", "Memos", "Stores"] as const;
type Tab = typeof tabs[number];

export default function App() {
  const [activeTab, setActiveTab] = createSignal<Tab>("Signals");

  return (
    <>
      <h1>SolidJS x TypeScript-Go</h1>
      <p class="subtitle">
        Interactive demo of <span class="badge stable">stable</span>{" "}
        <span class="badge mutator">mutator</span>{" "}
        <span class="badge invalidates">invalidates</span> modifiers
      </p>

      <div class="tabs">
        <For each={[...tabs]}>
          {(tab) => (
            <button
              class={`tab ${activeTab() === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          )}
        </For>
      </div>

      {activeTab() === "Signals" && <SignalDemo />}
      {activeTab() === "Memos" && <MemoDemo />}
      {activeTab() === "Stores" && <StoreDemo />}

      <footer>
        <p>
          Built with{" "}
          <a href="https://github.com/nicolo-ribaudo/tc39-proposal-stable-callable" target="_blank">
            stable/mutator/invalidates
          </a>{" "}
          in{" "}
          <a href="https://github.com/nicolo-ribaudo/TypeScript/tree/stable" target="_blank">
            TypeScript-Go
          </a>
        </p>
        <p style={{ "margin-top": "0.5rem" }}>
          <a href="https://github.com/kbrilla/typescript-go/pull/2" target="_blank">PR</a>
          {" | "}
          <a href="https://github.com/kbrilla/solid/tree/stable-mutator-demo" target="_blank">SolidJS Fork</a>
          {" | "}
          <a href="https://github.com/kbrilla/solidjs-stable-mutator-demo" target="_blank">This Repo</a>
        </p>
      </footer>
    </>
  );
}
