const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text) as { detail?: string };
      throw new Error(parsed.detail || `API ${res.status}`);
    } catch {
      throw new Error(text || `API ${res.status}`);
    }
  }
  return res.json();
}

export function apiFormData<T = unknown>(path: string, body: FormData): Promise<T> {
  return fetch(`${API_BASE}${path}`, { method: "POST", body }).then(async (r) => {
    if (!r.ok) throw new Error(`API ${r.status}: ${await r.text()}`);
    return r.json();
  });
}

