"use client";

import type { AguiEvent } from "@/lib/types";

function providerBadge(ev: AguiEvent) {
  const p = ev.provider as string | undefined;
  if (!p) return null;
  return (
    <span className={`provider ${p}`}>
      {p}
      {ev.fallback_used ? " (fallback)" : ""}
    </span>
  );
}

function describe(ev: AguiEvent): string {
  switch (ev.type) {
    case "a2a.message":
      return `${ev.from ?? "?"} → ${ev.to ?? "?"}: ${truncate(ev.text)}`;
    case "mcp.tool_call":
      return ev.phase === "result"
        ? `🛠 ${ev.tool} ✓ (${ev.caller})`
        : `🛠 ${ev.tool} … (${ev.caller})`;
    case "approval.request":
      return `⏳ approval: ${ev.title}`;
    case "decision":
      return `${ev.approved ? "✅" : "❌"} ${ev.title} (${ev.by})`;
    case "agent.status":
      return `${ev.agent} → ${ev.status}`;
    case "mode.changed":
      return `mode → ${ev.mode}`;
    case "appraisal":
      return `📊 Hamza appraised ${ev.agent}: ${ev.score}`;
    case "learning":
      return `🧠 learning: ${ev.title ?? ""}`;
    default:
      return ev.type;
  }
}

function truncate(v: unknown, n = 80): string {
  const s = String(v ?? "");
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export function ActivityFeed({ events }: { events: AguiEvent[] }) {
  return (
    <section className="panel feed">
      <div className="panel-head">
        <h2>Activity Feed</h2>
        <span className="count">{events.length}</span>
      </div>
      <ul className="feed-list">
        {events.map((ev, i) => (
          <li key={`${ev.seq ?? i}-${i}`} className={`feed-item ${ev.type.replace(".", "-")}`}>
            <span className="feed-text">{describe(ev)}</span>
            {providerBadge(ev)}
          </li>
        ))}
        {events.length === 0 && <li className="empty">Waiting for events…</li>}
      </ul>
    </section>
  );
}
