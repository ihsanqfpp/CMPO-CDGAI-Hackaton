"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { ChatMessage } from "@/hooks/useAgui";

const COLORS: Record<string, string> = {
  operator: "#8ea2c9",
  maryam: "#e0a83a",
  tariq: "#4aa9e0",
  momin: "#a98cf0",
  zain: "#2bb673",
  hamza: "#e0654a",
  naqash: "#5b8def",
  fateh: "#37bdd0",
  shams: "#4aa9e0",
  usman: "#6fb0a0",
  ihsan: "#e09a4a",
};

const ROLES: Record<string, string> = {
  operator: "Operator",
  maryam: "Orchestrator",
  tariq: "Researcher",
  momin: "Manager",
  zain: "Comms & Outreach",
  hamza: "Appraiser",
  naqash: "Dev Lead",
  fateh: "Frontend",
  shams: "Backend",
  usman: "DevOps",
  ihsan: "Tester",
};

function initials(name: string): string {
  const parts = (name || "?").split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// Maryam's direct reports — quick @-tags for giving orders.
const TAGS = [
  { id: "tariq", label: "Tariq" },
  { id: "momin", label: "Momin" },
  { id: "zain", label: "Zain" },
  { id: "hamza", label: "Hamza" },
];

// Polls the thread from the backend (works with or without a live SSE stream).
export function ChatPanel() {
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await apiGet<{ messages: ChatMessage[] }>("/api/chat?limit=80");
      setThread(r.messages ?? []);
    } catch {
      /* backend not reachable yet */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  function tag(id: string) {
    setText((t) => (t.startsWith(`@${id} `) ? t : `@${id} ${t.replace(/^@\w+\s/, "")}`));
  }

  async function send() {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    setText("");
    try {
      const r = await apiPost<{ messages?: ChatMessage[] }>("/api/chat", { text: t });
      if (r.messages) setThread(r.messages);
    } catch {
      /* a long cascade may time out on serverless — polling still catches up */
    } finally {
      setBusy(false);
      load();
    }
  }

  return (
    <section className="panel chat-panel">
      <div className="panel-head">
        <div className="panel-title">
          <h2>Team Chat</h2>
          <span className="panel-hint">You are Maryam — give the team orders</span>
        </div>
        <span className="count">{thread.length}</span>
      </div>

      <div className="chat-thread">
        {thread.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p className="chat-empty-title">Brief your team</p>
            <p className="empty">
              Tag a teammate and give an order — e.g. “@momin build the backend API”.
              They&apos;ll cascade it down the team and report back.
            </p>
          </div>
        )}
        {thread.map((m, i) => {
          const color = COLORS[m.sender] ?? "#8294b8";
          const mine = m.sender === "maryam";
          return (
            <div key={i} className={`chat-msg ${mine ? "mine" : ""}`}>
              <span className="chat-avatar" style={{ background: color }}>
                {initials(m.name)}
              </span>
              <div className="chat-body">
                <div className="chat-meta">
                  <span className="chat-name">
                    {m.sender === "maryam" ? "Maryam" : m.name}
                  </span>
                  <span className="chat-role">{ROLES[m.sender] ?? "Agent"}</span>
                  {m.to_name && <span className="chat-arrow">→ {m.to_name}</span>}
                  {m.provider && (
                    <span className={`provider ${m.provider}`}>
                      {m.provider}
                      {m.fallback_used ? " ↩" : ""}
                    </span>
                  )}
                </div>
                <div className="chat-bubble" style={{ "--accent": color } as CSSProperties}>
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        {busy && (
          <div className="chat-typing">
            <span></span><span></span><span></span> the team is working…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="tag-row">
        <span className="tag-label">Tag:</span>
        {TAGS.map((t) => (
          <button key={t.id} className="tag-chip" onClick={() => tag(t.id)}>
            @{t.label}
          </button>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={text}
          placeholder="Give an order, e.g. @momin build the backend…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={busy}
        />
        <button onClick={send} disabled={busy || !text.trim()}>
          {busy ? "…" : "Send"}
        </button>
      </div>
    </section>
  );
}
