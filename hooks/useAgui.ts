"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";
import type { AguiEvent, NodeStatus } from "@/lib/types";

const MAX_FEED = 200;

/**
 * Subscribes to the backend AG-UI SSE stream and exposes derived state:
 * a rolling activity feed, live per-agent status, pending approvals, and the
 * current Maryam mode. This is the single source of realtime truth for the UI.
 */
export interface ChatMessage {
  sender: string;
  name: string;
  to?: string | null;
  to_name?: string | null;
  text: string;
  provider?: string | null;
  fallback_used?: boolean;
}

export interface CodeArtifact {
  agent: string;
  name: string;
  area: string;
  filename: string;
  language: string;
  code: string;
  note: string;
  provider?: string;
}

export function useAgui() {
  const [events, setEvents] = useState<AguiEvent[]>([]);
  const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
  const [pending, setPending] = useState<Record<string, AguiEvent>>({});
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [artifacts, setArtifacts] = useState<CodeArtifact[]>([]);
  const [mode, setMode] = useState<string>("assist");
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`${API_BASE}/api/agui/stream`);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (raw) => {
      let ev: AguiEvent;
      try {
        ev = JSON.parse(raw.data);
      } catch {
        return;
      }

      if (ev.type === "agui.connected") return;

      setEvents((prev) => [ev, ...prev].slice(0, MAX_FEED));

      switch (ev.type) {
        case "chat.message":
          setChat((c) => [
            ...c,
            {
              sender: ev.sender as string,
              name: ev.name as string,
              to: ev.to as string | null,
              to_name: ev.to_name as string | null,
              text: ev.text as string,
              provider: ev.provider as string | null,
              fallback_used: ev.fallback_used as boolean,
            },
          ]);
          break;
        case "agent.status":
          setStatuses((s) => ({
            ...s,
            [ev.agent as string]: ev.status as NodeStatus,
          }));
          break;
        case "approval.request":
          setPending((p) => ({ ...p, [ev.id as string]: ev }));
          if (ev.requester) {
            setStatuses((s) => ({
              ...s,
              [ev.requester as string]: "waiting-approval",
            }));
          }
          break;
        case "decision":
          setPending((p) => {
            const next = { ...p };
            delete next[ev.approval_id as string];
            return next;
          });
          break;
        case "artifact":
          setArtifacts((a) => [
            {
              agent: ev.agent as string,
              name: ev.name as string,
              area: ev.area as string,
              filename: ev.filename as string,
              language: ev.language as string,
              code: ev.code as string,
              note: ev.note as string,
              provider: ev.provider as string,
            },
            ...a,
          ].slice(0, 40));
          break;
        case "mode.changed":
          setMode(ev.mode as string);
          break;
      }
    };

    return () => es.close();
  }, []);

  return {
    events, statuses, pending, chat, setChat,
    artifacts, mode, setMode, connected,
  };
}
