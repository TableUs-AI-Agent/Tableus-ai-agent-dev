import { webApiOrigin } from "./runtime-config";

const API_BASE = webApiOrigin() || "http://localhost:8000";

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    let detail = "";
    try {
      const parsed = JSON.parse(text) as { detail?: string };
      detail = parsed.detail || "";
    } catch {
      // Use the raw body below when the response is not JSON.
    }
    throw new Error(detail || text || `API ${res.status}`);
  }
  return res.json();
}

export function apiFormData<T = unknown>(path: string, body: FormData): Promise<T> {
  return fetch(`${API_BASE}${path}`, { method: "POST", body }).then(async (r) => {
    if (!r.ok) throw new Error(`API ${r.status}: ${await r.text()}`);
    return r.json();
  });
}
