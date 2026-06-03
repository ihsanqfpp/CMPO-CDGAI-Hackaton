"use client";

import { Handle, Position } from "reactflow";
import type { NodeStatus } from "@/lib/types";

const STATUS_COLOR: Record<NodeStatus, string> = {
  idle: "#5b8def",
  working: "#3ef0a3",
  "waiting-approval": "#f5c451",
  error: "#f0573e",
};

export interface AgentNodeData {
  name: string;
  role: string;
  status: NodeStatus;
  center?: boolean;
  monitor?: boolean;
  lead?: boolean;
}

export function AgentNode({ data }: { data: AgentNodeData }) {
  const color = STATUS_COLOR[data.status] ?? STATUS_COLOR.idle;
  const size = data.center ? 132 : 92;

  return (
    <div className="agent-node-wrap">
      <Handle type="target" position={Position.Top} className="rf-handle" />
      <Handle type="source" position={Position.Bottom} className="rf-handle" />
      <Handle type="target" position={Position.Left} className="rf-handle" />
      <Handle type="source" position={Position.Right} className="rf-handle" />
      <div
        className={`agent-node ${data.center ? "center" : ""} ${
          data.monitor ? "monitor" : ""
        } status-${data.status}`}
        style={{
          width: size,
          height: size,
          borderColor: color,
          boxShadow: `0 0 18px ${color}, 0 0 42px ${color}55`,
        }}
      >
        <span className="agent-name">{data.name}</span>
        <span className="agent-role">{data.role}</span>
        {data.lead && <span className="lead-star">★</span>}
        <span
          className="status-dot"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}
