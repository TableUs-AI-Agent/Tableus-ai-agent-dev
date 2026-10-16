import { ApiError, createApiClient, createTableUsApi } from "@tableus/api-client";

import { webApiOrigin } from "./runtime-config";
import { isSupabaseConfigured, supabase } from "./supabase-browser";

/** Local development without Supabase signs in as a seeded demo person. */
export const DEMO_PEOPLE = [
  { id: "demo-organizer", name: "Demo Organizer" },
  { id: "demo-guest", name: "Demo Guest" },
] as const;
const DEMO_KEY = "tableus.demo-user";

export function demoUser(): string | null {
  if (isSupabaseConfigured || typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(DEMO_KEY);
  } catch {
    return null;
  }
}

export function setDemoUser(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(DEMO_KEY, id);
    else window.localStorage.removeItem(DEMO_KEY);
  } catch {
    // Private browsing: the demo choice lasts for this page only.
  }
}

const client = createApiClient({
  baseUrl: webApiOrigin(),
  getDemoUserId: async () => demoUser(),
  getAccessToken: isSupabaseConfigured
    ? async () => (await supabase.auth.getSession()).data.session?.access_token ?? null
    : undefined,
  refreshAccessToken: isSupabaseConfigured
    ? async () => (await supabase.auth.refreshSession()).data.session?.access_token ?? null
    : undefined,
  requestTimeoutMs: 20_000,
});

export const api = createTableUsApi(client);

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Check your connection and try again.";
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
