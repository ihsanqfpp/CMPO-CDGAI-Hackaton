// Thin client for the CDG AI FastAPI backend.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

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
