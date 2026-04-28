import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Activity,
  Bot,
  Braces,
  Database,
  MessageSquare,
  Play,
  RefreshCcw,
  Send,
} from "lucide-react";
import "./styles.css";

const DEFAULT_LEAD_MESSAGE = `Lead Hektor recu:
- Nom: Dupont
- Email: dupont@example.com
- Telephone: 0600000000
- Projet: vendre une maison
- Ville: Saint-Macaire
- Message: Je souhaite une estimation rapide de ma maison.

Redige une premiere reponse professionnelle, courte, en francais, pour proposer un contact rapide.`;

const DEFAULT_RAW_BODY = `{
  "title": "Test lead CGI33",
  "type": "lead_response",
  "disableFirstMessage": true
}`;

function formatJson(value) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function safeJsonParse(value) {
  if (!value.trim()) {
    return undefined;
  }

  return JSON.parse(value);
}

async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.data = data;
    throw error;
  }

  return data;
}

function Field({label, children}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ActionButton({children, icon: Icon = Play, busy, ...props}) {
  return (
    <button className="action-button" type="button" disabled={busy} {...props}>
      <Icon size={16} />
      <span>{busy ? "Running..." : children}</span>
    </button>
  );
}

function ResultPanel({result, error}) {
  return (
    <section className="result-panel" aria-live="polite">
      <div className="panel-title">
        <Braces size={17} />
        <span>Last result</span>
      </div>
      <pre>{error ? formatJson(error) : result ? formatJson(result) : "No request yet."}</pre>
    </section>
  );
}

function App() {
  const [busy, setBusy] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [conversationId, setConversationId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [leadMessage, setLeadMessage] = useState(DEFAULT_LEAD_MESSAGE);
  const [rawMethod, setRawMethod] = useState("GET");
  const [rawPath, setRawPath] = useState("");
  const [rawBody, setRawBody] = useState(DEFAULT_RAW_BODY);

  async function run(label, handler) {
    setBusy(label);
    setError(null);

    try {
      const data = await handler();
      setResult(data);
      await loadLogs();
    } catch (requestError) {
      setError(requestError.data || {message: requestError.message});
    } finally {
      setBusy("");
    }
  }

  async function loadLogs() {
    const data = await apiFetch("/api/logs");
    setLogs(data.logs || []);
  }

  useEffect(() => {
    run("health", () => apiFetch("/api/health"));
  }, []);

  const createConversationPayload = {
    title: "Test lead CGI33",
    type: "lead_response",
    botAgentId: agentId || undefined,
    disableFirstMessage: true,
  };

  const sendMessagePayload = {
    conversationId,
    agentId: agentId || undefined,
    content: leadMessage,
    userTimezone: "Europe/Paris",
    searchInWorkspace: false,
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Limova API</p>
          <h1>Testbench</h1>
        </div>
        <ActionButton icon={Activity} busy={busy === "health"} onClick={() => run("health", () => apiFetch("/api/health"))}>
          Check backend
        </ActionButton>
      </header>

      <section className="layout">
        <div className="workbench">
          <section className="tool-panel">
            <div className="panel-title">
              <Bot size={17} />
              <span>Agent and conversation</span>
            </div>

            <div className="grid-two">
              <Field label="Agent ID">
                <input value={agentId} onChange={(event) => setAgentId(event.target.value)} placeholder="Optional if backend env has default" />
              </Field>
              <Field label="Conversation ID">
                <input value={conversationId} onChange={(event) => setConversationId(event.target.value)} placeholder="Set after create conversation" />
              </Field>
            </div>

            <div className="button-row">
              <ActionButton icon={Database} busy={busy === "profile"} onClick={() => run("profile", () => apiFetch("/api/limova/profile", {method: "POST"}))}>
                Profile
              </ActionButton>
              <ActionButton icon={Bot} busy={busy === "agents"} onClick={() => run("agents", () => apiFetch("/api/limova/agents", {method: "POST"}))}>
                Agents
              </ActionButton>
              <ActionButton
                icon={MessageSquare}
                busy={busy === "conversation"}
                onClick={() => run("conversation", () => apiFetch("/api/limova/conversations", {
                  method: "POST",
                  body: JSON.stringify(createConversationPayload),
                }))}
              >
                Create conversation
              </ActionButton>
            </div>
          </section>

          <section className="tool-panel">
            <div className="panel-title">
              <Send size={17} />
              <span>Lead response message</span>
            </div>

            <Field label="Lead message sent to Limova">
              <textarea value={leadMessage} onChange={(event) => setLeadMessage(event.target.value)} rows={11} />
            </Field>

            <ActionButton
              icon={Send}
              busy={busy === "message"}
              onClick={() => run("message", () => apiFetch("/api/limova/messages", {
                method: "POST",
                body: JSON.stringify(sendMessagePayload),
              }))}
            >
              Send message
            </ActionButton>
          </section>

          <section className="tool-panel">
            <div className="panel-title">
              <Braces size={17} />
              <span>Raw Limova request</span>
            </div>

            <div className="raw-row">
              <Field label="Method">
                <select value={rawMethod} onChange={(event) => setRawMethod(event.target.value)}>
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>
              </Field>
              <Field label="Path">
                <input value={rawPath} onChange={(event) => setRawPath(event.target.value)} placeholder="/path/from/limova/docs" />
              </Field>
            </div>

            <Field label="JSON body">
              <textarea value={rawBody} onChange={(event) => setRawBody(event.target.value)} rows={8} />
            </Field>

            <ActionButton
              icon={Play}
              busy={busy === "raw"}
              onClick={() => run("raw", () => apiFetch("/api/limova/request", {
                method: "POST",
                body: JSON.stringify({
                  method: rawMethod,
                  path: rawPath,
                  body: ["GET", "HEAD"].includes(rawMethod) ? undefined : safeJsonParse(rawBody),
                }),
              }))}
            >
              Run raw request
            </ActionButton>
          </section>
        </div>

        <aside className="side-column">
          <ResultPanel result={result} error={error} />

          <section className="log-panel">
            <div className="panel-title">
              <RefreshCcw size={17} />
              <span>Firestore logs</span>
              <button type="button" className="icon-button" onClick={loadLogs} title="Refresh logs">
                <RefreshCcw size={15} />
              </button>
            </div>
            <div className="log-list">
              {logs.length === 0 ? (
                <p className="empty">No logs yet.</p>
              ) : logs.map((log) => (
                <article className="log-item" key={log.id}>
                  <strong>{log.type}</strong>
                  <span>{log.response?.status || log.error?.statusCode || "local"}</span>
                  <code>{log.id}</code>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
