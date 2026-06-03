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

// Hand-tuned layout matching the reference diagram: Maryam centered, A2A peers
// to the right, the dev tree to the left, AG-UI operator below.
const POS: Record<string, { x: number; y: number }> = {
  maryam: { x: 520, y: 330 },
  hamza: { x: 520, y: 90 },
  tariq: { x: 800, y: 150 },
  momin: { x: 800, y: 330 },
  zain: { x: 800, y: 510 },
  naqash: { x: 250, y: 330 },
  fateh: { x: 40, y: 170 },
  shams: { x: 40, y: 330 },
  usman: { x: 40, y: 490 },
  ihsan: { x: 250, y: 560 },
};

function edgeStyle(e: GraphEdge): Partial<Edge> {
  if (e.kind === "direct")
    return {
      animated: true,
      style: { stroke: "#3ef0a3", strokeWidth: 2.5 },
    };
  if (e.kind === "dashed")
    return {
      animated: false,
      style: { stroke: "#7a86a8", strokeWidth: 1.3, strokeDasharray: "5 5" },
    };
  return { animated: false, style: { stroke: "#5b8def", strokeWidth: 1.6 } };
}

export function NetworkView({
  statuses,
}: {
  statuses: Record<string, NodeStatus>;
}) {
  const [roster, setRoster] = useState<RosterResponse | null>(null);

  useEffect(() => {
    apiGet<RosterResponse>("/api/agents")
      .then(setRoster)
      .catch(() => setRoster(null));
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
