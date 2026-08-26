import { createApiClient } from "@tableus/api-client";

import { isSupabaseConfigured, supabase } from "./supabase-browser";
import { getTelemetrySessionId } from "./telemetry";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export const v1Api = createApiClient({
  baseUrl,
  demoUserId: isSupabaseConfigured ? undefined : process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-organizer",
  getAccessToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
  getTelemetrySessionId,
  telemetryPlatform: "web",
});
