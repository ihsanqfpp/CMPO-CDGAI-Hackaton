"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

export function ModeToggle({
  mode,
  onMode,
}: {
  mode: string;
  onMode: (m: string) => void;
}) {
  const [learnCount, setLearnCount] = useState<number>(0);
  const [busy, setBusy] = useState(false);

  async function refreshLearning() {
    try {
      const r = await apiGet<{ count: number }>("/api/learning/count");
      setLearnCount(r.count);
    } catch {
      /* M9 endpoint; ignore until present */
    }
  }

  useEffect(() => {
    refreshLearning();
    const t = setInterval(refreshLearning, 4000);
    return () => clearInterval(t);
  }, []);

  async function toggle() {
    setBusy(true);
    try {
      const next = mode === "assist" ? "auto" : "assist";
      const r = await apiPost<{ mode: string }>("/api/agui/mode", { mode: next });
      onMode(r.mode);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mode-toggle">
      <button className={`switch ${mode}`} disabled={busy} onClick={toggle}>
        <span className="switch-label">Maryam</span>
        <span className="switch-track">
          <span className="switch-thumb" />
        </span>
        <span className="switch-value">{mode}</span>
      </button>
      <div className="learn-count" title="Decisions agent Maryam has recorded from human Maryam">
        🧠 learning log: <strong>{learnCount}</strong>
      </div>
    </div>
  );
}
