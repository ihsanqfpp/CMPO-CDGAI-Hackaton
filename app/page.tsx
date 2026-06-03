"use client";

import { useMemo } from "react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ApprovalConsole } from "@/components/ApprovalConsole";
import { ChatPanel } from "@/components/ChatPanel";
import { CodePanel } from "@/components/CodePanel";
import { FlowLauncher } from "@/components/FlowLauncher";
import { ModeToggle } from "@/components/ModeToggle";
import { NetworkView } from "@/components/NetworkView";
import { PerformancePanel } from "@/components/PerformancePanel";
import { useAgui } from "@/hooks/useAgui";

export default function Dashboard() {
  const { events, statuses, pending, artifacts, mode, setMode, connected } =
    useAgui();

  // PerformancePanel refetches whenever a new appraisal arrives.
  const appraisalTick = useMemo(
    () => events.filter((e) => e.type === "appraisal").length,
    [events]
  );

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">CD</span>
          <div className="brand-text">
            <h1>CDGAI</h1>
            <span className="brand-sub">Multi-Agent Operations</span>
          </div>
        </div>
        <div className="topbar-right">
          <span className={`conn ${connected ? "on" : "off"}`}>
            <span className="conn-dot" />
            {connected ? "Live" : "Offline"}
          </span>
          <ModeToggle mode={mode} onMode={setMode} />
        </div>
      </header>

      <div className="grid">
        <div className="col-graph">
          <NetworkView statuses={statuses} />
        </div>
        <div className="col-chat">
          <ChatPanel />
        </div>
        <aside className="col-side">
          <FlowLauncher />
          <ApprovalConsole pending={pending} mode={mode} />
          <PerformancePanel tick={appraisalTick} />
        </aside>
      </div>

      <div className="bottom-row">
        <CodePanel artifacts={artifacts} />
        <ActivityFeed events={events} />
      </div>
    </main>
  );
}
