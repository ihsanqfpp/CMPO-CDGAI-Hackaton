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

export function ChatPanel({ chat }: { chat: ChatMessage[] }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

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
        <h2>Team Conversation — Maryam drives</h2>
        <span className="count">{chat.length}</span>
      </div>

      <div className="chat-thread">
        {chat.length === 0 && (
          <p className="empty">
            Assign an objective below. Maryam will ask the team — they answer for real.
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
                  {m.name}
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

      <div className="chat-input">
        <input
          value={text}
          placeholder="Assign an objective to Maryam…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={busy}
        />
        <button onClick={send} disabled={busy || !text.trim()}>
          {busy ? "…" : "Assign"}
        </button>
      </div>
    </section>
  );
}
