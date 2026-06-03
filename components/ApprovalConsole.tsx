"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import type { AguiEvent } from "@/lib/types";

export function ApprovalConsole({
  pending,
  mode,
}: {
  pending: Record<string, AguiEvent>;
  mode: string;
}) {
  const items = Object.values(pending);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Approval Console</h2>
        <span className={`mode-pill ${mode}`}>{mode.toUpperCase()}</span>
      </div>
      {items.length === 0 ? (
        <p className="empty">
          {mode === "auto"
            ? "Auto mode — agent Maryam is resolving decisions."
            : "No pending approvals."}
        </p>
      ) : (
        <ul className="approvals">
          {items.map((a) => (
            <ApprovalCard key={a.id as string} approval={a} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ApprovalCard({ approval }: { approval: AguiEvent }) {
  const [busy, setBusy] = useState(false);

  async function decide(approved: boolean) {
    setBusy(true);
    try {
      await apiPost("/api/agui/approve", {
        approval_id: approval.id,
        approved,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="approval-card">
      <div className="approval-kind">{String(approval.kind)}</div>
      <div className="approval-title">{String(approval.title)}</div>
      <div className="approval-detail">{String(approval.detail)}</div>
      <div className="approval-from">from {String(approval.requester)}</div>
      <div className="approval-actions">
        <button disabled={busy} className="btn approve" onClick={() => decide(true)}>
          Approve
        </button>
        <button disabled={busy} className="btn reject" onClick={() => decide(false)}>
          Reject
        </button>
      </div>
    </li>
  );
}
