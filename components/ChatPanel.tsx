"use client";

import { useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/api";
import type { ChatMessage } from "@/hooks/useAgui";

const COLORS: Record<string, string> = {
  operator: "#e6ecfb",
  maryam: "#f5c451",
  tariq: "#7fd0ff",
  momin: "#c9a8ff",
  zain: "#3ef0a3",
  hamza: "#f0573e",
  naqash: "#5b8def",
  fateh: "#7fd0ff",
  shams: "#7fd0ff",
  usman: "#7fd0ff",
  ihsan: "#ffb27f",
};

// Maryam's direct reports — quick @-tags for giving orders.
const TAGS = [
  { id: "tariq", label: "@Tariq" },
  { id: "momin", label: "@Momin" },
  { id: "zain", label: "@Zain" },
  { id: "hamza", label: "@Hamza" },
];

export function ChatPanel({ chat }: { chat: ChatMessage[] }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  function tag(id: string) {
    setText((t) => (t.startsWith(`@${id} `) ? t : `@${id} ${t.replace(/^@\w+\s/, "")}`));
  }

  async function send() {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    setText("");
    try {
      await apiPost("/api/chat", { text: t });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel chat-panel">
      <div className="panel-head">
        <h2>You are Maryam — give orders</h2>
        <span className="count">{chat.length}</span>
      </div>

      <div className="chat-thread">
        {chat.length === 0 && (
          <p className="empty">
            Tag a teammate and give an order — e.g. “@momin build the backend API”.
            They&apos;ll cascade it down the team and report back.
          </p>
        )}
        {chat.map((m, i) => {
          const color = COLORS[m.sender] ?? "#8294b8";
          const mine = m.sender === "operator";
          return (
            <div key={i} className={`chat-msg ${mine ? "mine" : ""}`}>
              <div className="chat-meta">
                <span className="chat-avatar" style={{ background: color }}>
                  {m.name?.[0] ?? "?"}
                </span>
                <span className="chat-name" style={{ color }}>
                  {m.sender === "maryam" ? "Maryam (you)" : m.name}
                  {m.to_name && (
                    <span className="chat-arrow"> → {m.to_name}</span>
                  )}
                </span>
                {m.provider && (
                  <span className={`provider ${m.provider}`}>
                    {m.provider}
                    {m.fallback_used ? " ↩" : ""}
                  </span>
                )}
              </div>
              <div className="chat-bubble">{m.text}</div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="tag-row">
        {TAGS.map((t) => (
          <button key={t.id} className="tag-chip" onClick={() => tag(t.id)}>
            {t.label}
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
