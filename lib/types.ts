// Shared types mirroring the backend API shapes.
export type NodeStatus = "idle" | "working" | "waiting-approval" | "error";

export interface AgentCard {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: string[];
  lead: boolean;
  monitor: boolean;
  cardPath: string;
  status?: NodeStatus;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  kind: "solid" | "dashed" | "direct";
  bidirectional: boolean;
}

export interface RosterResponse {
  agents: AgentCard[];
  edges: GraphEdge[];
}

export interface PendingApproval {
  id: string;
  title: string;
  detail: string;
  requester: string;
  kind: string;
  context: Record<string, unknown>;
}

// AG-UI event envelope (one shape over the SSE stream).
export interface AguiEvent {
  seq?: number;
  type: string;
  [key: string]: unknown;
}
