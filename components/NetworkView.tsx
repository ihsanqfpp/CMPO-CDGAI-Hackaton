"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { apiGet } from "@/lib/api";
import type { GraphEdge, NodeStatus, RosterResponse } from "@/lib/types";
import { AgentNode } from "./AgentNode";

const nodeTypes = { agent: AgentNode };

// Top-down hierarchy: Maryam at the top, her reports beneath, then the dev tree
// under Momin → Naqash → (Fateh/Shams/Usman/Ihsan).
const POS: Record<string, { x: number; y: number }> = {
  maryam: { x: 470, y: 20 },
  tariq: { x: 120, y: 180 },
  momin: { x: 420, y: 180 },
  zain: { x: 700, y: 180 },
  hamza: { x: 950, y: 180 },
  naqash: { x: 420, y: 340 },
  fateh: { x: 140, y: 510 },
  shams: { x: 360, y: 510 },
  usman: { x: 580, y: 510 },
  ihsan: { x: 800, y: 510 },
};

function edgeStyle(e: GraphEdge): Partial<Edge> {
  const base = { type: "smoothstep" as const };
  if (e.kind === "direct")
    return { ...base, animated: true, style: { stroke: "#3ef0a3", strokeWidth: 2.5 } };
  if (e.kind === "dashed")
    return {
      ...base,
      animated: false,
      style: { stroke: "#7a86a8", strokeWidth: 1.3, strokeDasharray: "5 5" },
    };
  return { ...base, animated: false, style: { stroke: "#5b8def", strokeWidth: 1.6 } };
}

export function NetworkView({
  statuses,
}: {
  statuses: Record<string, NodeStatus>;
}) {
  const [roster, setRoster] = useState<RosterResponse | null>(null);

  useEffect(() => {
    let alive = true;
    // Retry until the roster loads (the backend may not be up at first mount),
    // then keep it fresh. Without this the graph stays empty forever if the
    // first fetch fails.
    const fetchRoster = () =>
      apiGet<RosterResponse>("/api/agents")
        .then((r) => {
          if (alive && r?.agents?.length) setRoster(r);
        })
        .catch(() => {});
    fetchRoster();
    const t = setInterval(fetchRoster, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const nodes: Node[] = useMemo(() => {
    if (!roster) return [];
    const agentNodes: Node[] = roster.agents.map((a) => ({
      id: a.id,
      type: "agent",
      position: POS[a.id] ?? { x: 400, y: 300 },
      data: {
        name: a.name,
        role: a.role,
        status: statuses[a.id] ?? a.status ?? "idle",
        center: a.id === "maryam",
        monitor: a.monitor,
        lead: a.lead,
      },
      draggable: true,
    }));

    // Protocol lane labels around Maryam (MCP left, A2A right, AG-UI down).
    const lanes: Node[] = [
      laneNode("lane-mcp", "MCP › Tools / APIs", 150, 40),
      laneNode("lane-a2a", "A2A › Agents", 800, 40),
      laneNode("lane-agui", "AG-UI › Operator Browser", 470, 640),
    ];
    return [...lanes, ...agentNodes];
  }, [roster, statuses]);

  const edges: Edge[] = useMemo(() => {
    if (!roster) return [];
    return roster.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      labelStyle: { fill: "#9fb0d0", fontSize: 10 },
      labelBgStyle: { fill: "#0d1326", fillOpacity: 0.8 },
      ...edgeStyle(e),
    }));
  }, [roster]);

  return (
    <div className="network-view">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={26} size={1} color="#1c2742" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

function laneNode(id: string, label: string, x: number, y: number): Node {
  return {
    id,
    position: { x, y },
    data: { label },
    draggable: false,
    selectable: false,
    className: "lane-label",
    style: {
      background: "transparent",
      border: "1px dashed #2c3a63",
      color: "#7fa0e0",
      fontSize: 11,
      letterSpacing: "0.08em",
      padding: "4px 10px",
      borderRadius: 6,
    },
  };
}
