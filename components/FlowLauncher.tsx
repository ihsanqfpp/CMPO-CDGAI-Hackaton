"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

// Preset objectives handed to Maryam — she asks the team and they answer for real.
const OBJECTIVES = [
  {
    id: "build",
    label: "Idea & Build",
    text: "Research a promising new product idea and build it end-to-end with the dev team.",
  },
  {
    id: "outreach",
    label: "Daily Outreach",
    text: "Handle today's LinkedIn post and email replies, then report progress.",
  },
];

export function FlowLauncher() {
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");

  async function assign(id: string, text: string) {
    setBusy(id);
    setNote("");
    try {
      await apiPost("/api/chat", { text });
      setNote("Objective assigned — Maryam is briefing the team.");
    } catch (e) {
      setNote(`Failed: ${String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function runEventApproval() {
    setBusy("event");
    setNote("");
    try {
      await apiPost("/api/flows/event", {});
      setNote("Zain is searching events — watch for an approval request.");
    } catch (e) {
      setNote(`Failed: ${String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Assign an Objective</h2>
      </div>
      <div className="flow-buttons">
        {OBJECTIVES.map((o) => (
          <button
            key={o.id}
            className="flow-btn"
            disabled={busy !== null}
            onClick={() => assign(o.id, o.text)}
            title={o.text}
          >
            {busy === o.id ? "Assigning…" : o.label}
          </button>
        ))}
        <button
          className="flow-btn"
          disabled={busy !== null}
          onClick={runEventApproval}
          title="Zain finds an event via MCP, then requests Maryam's approval (HITL)"
        >
          {busy === "event" ? "Running…" : "Find Event (approval)"}
        </button>
      </div>
      {note && <p className="flow-note">{note}</p>}
    </section>
  );
}
