import { fetch as expoFetch } from "expo/fetch";
import { createApiClient } from "@tableus/api-client";

import { isSupabaseConfigured, supabase } from "./supabase";
import { getLocalE2EIdentity, localE2EEnabled } from "./e2e-identity";

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export const api = createApiClient({
  baseUrl,
  demoUserId: isSupabaseConfigured || localE2EEnabled ? undefined : process.env.EXPO_PUBLIC_DEMO_USER_ID ?? "demo-organizer",
  getDemoUserId: localE2EEnabled ? getLocalE2EIdentity : undefined,
  getAccessToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
  fetchImpl: expoFetch as typeof fetch,
});
