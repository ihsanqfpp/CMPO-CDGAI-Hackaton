"use client";

import { useMemo, useState } from "react";
import type { CodeArtifact } from "@/hooks/useAgui";

interface TreeNode {
  dirs: Map<string, TreeNode>;
  files: { name: string; art: CodeArtifact }[];
}

function emptyNode(): TreeNode {
  return { dirs: new Map(), files: [] };
}

function buildTree(arts: CodeArtifact[]): TreeNode {
  const root = emptyNode();
  for (const art of arts) {
    const parts = (art.filename || "file").split("/").filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const d = parts[i];
      if (!node.dirs.has(d)) node.dirs.set(d, emptyNode());
      node = node.dirs.get(d)!;
    }
    node.files.push({ name: parts[parts.length - 1] || "file", art });
  }
  return root;
}

function FileRow({ art, depth }: { art: CodeArtifact; depth: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="tree-file"
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="tree-icon">📄</span>
        <span className="tree-name">{art.filename.split("/").pop()}</span>
        <span className="tree-lang">{art.language}</span>
        <span className="tree-author">{art.name}</span>
      </button>
      {open && (
        <pre className="code-block">
          <code>{art.code}</code>
        </pre>
      )}
    </>
  );
}

function TreeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  return (
    <>
      {[...node.dirs.entries()].map(([dir, child]) => (
        <div key={dir}>
          <div className="tree-dir" style={{ paddingLeft: 8 + depth * 16 }}>
            <span className="tree-icon">📁</span>
            {dir}/
          </div>
          <TreeView node={child} depth={depth + 1} />
        </div>
      ))}
      {node.files.map((f, i) => (
        <FileRow key={f.art.filename + i} art={f.art} depth={depth} />
      ))}
    </>
  );
}

export function CodePanel({ artifacts }: { artifacts: CodeArtifact[] }) {
  // Group by project (newest first), dedupe by path (keep newest).
  const projects = useMemo(() => {
    const order: string[] = [];
    const byProject = new Map<string, Map<string, CodeArtifact>>();
    for (const a of artifacts) {
      const proj = a.project || "project";
      if (!byProject.has(proj)) {
        byProject.set(proj, new Map());
        order.push(proj);
      }
      const files = byProject.get(proj)!;
      if (!files.has(a.filename)) files.set(a.filename, a); // newest-first wins
    }
    return order.map((p) => ({ name: p, arts: [...byProject.get(p)!.values()] }));
  }, [artifacts]);

  const [sel, setSel] = useState(0);
  const current = projects[sel] ?? projects[0];

  return (
    <section className="panel code-panel">
      <div className="panel-head">
        <h2>Project Files — developers building</h2>
        <span className="count">{artifacts.length}</span>
      </div>

      {projects.length === 0 ? (
        <p className="empty">
          No code yet. Give a build order (e.g. “@momin build the backend”) — the
          developers create a real project (files &amp; folders) shown here.
        </p>
      ) : (
        <>
          {projects.length > 1 && (
            <select
              className="proj-select"
              value={sel}
              onChange={(e) => setSel(Number(e.target.value))}
            >
              {projects.map((p, i) => (
                <option key={p.name} value={i}>
                  {p.name} ({p.arts.length} files)
                </option>
              ))}
            </select>
          )}
          <div className="tree">
            <div className="tree-root">📦 {current.name}</div>
            <TreeView node={buildTree(current.arts)} />
          </div>
        </>
      )}
    </section>
  );
}
