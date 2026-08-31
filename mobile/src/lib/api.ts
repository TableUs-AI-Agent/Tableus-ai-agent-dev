import { fetch as expoFetch } from "expo/fetch";
import { createApiClient } from "@tableus/api-client";
import { PUBLIC_RUNTIME_POLICY, requireExactHttpsOrigin } from "@tableus/domain";

import { getSupabaseAccessToken, isSupabaseConfigured, refreshSupabaseAccessToken } from "./supabase";
import { getLocalE2EIdentity, localE2EEnabled } from "./e2e-identity";
import { getTelemetryPlatform, getTelemetrySessionId } from "./telemetry";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
const baseUrl = localE2EEnabled
  ? configuredApiUrl
  : configuredApiUrl
    ? requireExactHttpsOrigin(
        configuredApiUrl,
        PUBLIC_RUNTIME_POLICY.stagingApiOrigin,
        "Mobile API origin",
      )
    : "https://api.invalid";

export const api = createApiClient({
  baseUrl,
  demoUserId: isSupabaseConfigured || localE2EEnabled ? undefined : process.env.EXPO_PUBLIC_DEMO_USER_ID,
  getDemoUserId: localE2EEnabled ? getLocalE2EIdentity : undefined,
  getAccessToken: isSupabaseConfigured ? getSupabaseAccessToken : undefined,
  refreshAccessToken: isSupabaseConfigured ? refreshSupabaseAccessToken : undefined,
  getTelemetrySessionId,
  telemetryPlatform: getTelemetryPlatform(),
  fetchImpl: expoFetch as typeof fetch,
  requestTimeoutMs: localE2EEnabled ? 10_000 : 45_000,
});
