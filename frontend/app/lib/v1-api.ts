import { createApiClient } from "@tableus/api-client";

import { isSupabaseConfigured, supabase } from "./supabase-browser";
import { getTelemetrySessionId } from "./telemetry";
import { notifyAuthorizationBoundary } from "./authorization-boundary";
import { webApiOrigin } from "./runtime-config";

const baseUrl = webApiOrigin();

export const v1Api = createApiClient({
  baseUrl,
  demoUserId: isSupabaseConfigured ? undefined : process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-organizer",
  getAccessToken: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session?.access_token ?? null;
  },
  refreshAccessToken: async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session?.access_token ?? null;
  },
  getTelemetrySessionId,
  telemetryPlatform: "web",
  onAuthorizationError: notifyAuthorizationBoundary,
  requestTimeoutMs: 15_000,
});
