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
    apiGet<{ appraisals: Appraisal[] }>("/api/appraisals")
      .then((r) => setRows(r.appraisals))
      .catch(() => setRows([]));
  }, [tick]);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Performance — Hamza</h2>
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
