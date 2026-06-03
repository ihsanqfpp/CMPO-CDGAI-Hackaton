"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Appraisal {
  agent: string;
  score: number;
  flag?: string;
  note?: string;
}

export function PerformancePanel({ tick }: { tick: number }) {
  const [rows, setRows] = useState<Appraisal[]>([]);

  useEffect(() => {
    let alive = true;
    const fetchRows = () =>
      apiGet<{ appraisals: Appraisal[] }>("/api/appraisals")
        .then((r) => alive && setRows(r.appraisals))
        .catch(() => {});
    fetchRows();
    // Real-time: refresh on every appraisal event (tick) and on a 3s interval.
    const t = setInterval(fetchRows, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [tick]);

  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-title">
          <h2>Performance</h2>
          <span className="panel-hint">Live appraisals by Hamza</span>
        </div>
        <span className="live-dot" title="updating live" />
      </div>
      {rows.length === 0 ? (
        <p className="empty">No appraisals yet. Run a flow.</p>
      ) : (
        <ul className="appraisals">
          {rows.map((a) => (
            <li key={a.agent} className="appraisal-row">
              <span className="appraisal-agent">{a.agent}</span>
              <span className="score-bar">
                <span
                  className="score-fill"
                  style={{
                    width: `${a.score}%`,
                    background:
                      a.score >= 70 ? "#3ef0a3" : a.score >= 40 ? "#f5c451" : "#f0573e",
                  }}
                />
              </span>
              <span className="appraisal-score">{a.score}</span>
              {a.flag && <span className={`flag ${a.flag}`}>{a.flag}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
