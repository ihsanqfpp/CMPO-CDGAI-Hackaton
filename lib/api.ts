// Thin client for the CDGAI FastAPI backend.
// Resolution order:
//   1. NEXT_PUBLIC_API_BASE (set in Vercel/.env.local) — always wins.
//   2. In a deployed browser (non-localhost host) → the deployed backend URL.
//   3. Local dev / SSR → http://localhost:8000.
const DEPLOYED_BACKEND = "https://cmpo-cdgai-backend-agents-3i4u.vercel.app";

function resolveBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") return DEPLOYED_BACKEND;
  }
  return "http://localhost:8000";
}

export const API_BASE = resolveBase();

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

/** Subscribe to the AG-UI Server-Sent Events stream from the backend. */
export function subscribeAgui(
  onEvent: (event: unknown) => void,
  onError?: (e: Event) => void,
): EventSource {
  const es = new EventSource(`${API_BASE}/api/agui/stream`);
  es.onmessage = (ev) => {
    try {
      onEvent(JSON.parse(ev.data));
    } catch {
      /* ignore malformed frames */
    }
  };
  if (onError) es.onerror = onError;
  return es;
}
