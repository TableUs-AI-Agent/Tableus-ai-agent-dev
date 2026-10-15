import { ApiError, createApiClient, createTableUsApi } from "@tableus/api-client";
import { fetch as expoFetch } from "expo/fetch";

import { storage } from "./storage";
import { isSupabaseConfigured, supabase } from "./supabase";

/** Without Supabase (local development) people sign in as a seeded demo person. */
export const DEMO_PEOPLE = [
  { id: "demo-organizer", name: "Demo Organizer" },
  { id: "demo-guest", name: "Demo Guest" },
] as const;
const DEMO_KEY = "tableus.demo-user";
let demoId: string | null = null;

export async function loadDemoUser(): Promise<string | null> {
  if (isSupabaseConfigured) return null;
  demoId = await storage.getItem(DEMO_KEY);
  return demoId;
}

export async function setDemoUser(id: string | null): Promise<void> {
  demoId = id;
  if (id) await storage.setItem(DEMO_KEY, id);
  else await storage.removeItem(DEMO_KEY);
}

const client = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  fetchImpl: expoFetch as unknown as typeof fetch,
  getDemoUserId: async () => (isSupabaseConfigured ? null : demoId),
  getAccessToken: isSupabaseConfigured
    ? async () => (await supabase.auth.getSession()).data.session?.access_token ?? null
    : undefined,
  refreshAccessToken: isSupabaseConfigured
    ? async () => (await supabase.auth.refreshSession()).data.session?.access_token ?? null
    : undefined,
  requestTimeoutMs: 30_000,
});

export const api = createTableUsApi(client);

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Check your connection and try again.";
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
