"use client";

import { useState } from "react";
import type { CodeArtifact } from "@/hooks/useAgui";

export function CodePanel({ artifacts }: { artifacts: CodeArtifact[] }) {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="panel code-panel">
      <div className="panel-head">
        <h2>Generated Code — developers at work</h2>
        <span className="count">{artifacts.length}</span>
      </div>

      {artifacts.length === 0 ? (
        <p className="empty">
          No code yet. Give a build order (e.g. “@momin build the backend”) — the
          developers will start coding and their files appear here.
        </p>
      ) : (
        <div className="code-list">
          {artifacts.map((a, i) => (
            <div key={i} className="code-file">
              <button className="code-file-head" onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="code-author">{a.name}</span>
                <span className="code-filename">{a.filename}</span>
                <span className="code-lang">{a.language}</span>
                {a.provider && <span className={`provider ${a.provider}`}>{a.provider}</span>}
                <span className="code-toggle">{open === i ? "▾" : "▸"}</span>
              </button>
              {open === i && (
                <pre className="code-block">
                  <code>{a.code}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
