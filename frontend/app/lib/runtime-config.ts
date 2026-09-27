import { PUBLIC_RUNTIME_POLICY, requireExactHttpsOrigin } from "@tableus/domain";

function localDevelopmentOrigin(value: string, nodeEnv: string | undefined): string | null {
  if (nodeEnv === "production") return null;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (
    parsed.protocol !== "http:"
    || !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)
    || parsed.username
    || parsed.password
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
  ) {
    return null;
  }
  return parsed.origin;
}

function optionalApprovedOrigin(
  value: string | undefined,
  expected: string,
  label: string,
  nodeEnv: string | undefined,
): string {
  if (!value) return "";
  return localDevelopmentOrigin(value, nodeEnv) ?? requireExactHttpsOrigin(value, expected, label);
}

export function webApiOrigin(
  value = process.env.NEXT_PUBLIC_API_URL,
  nodeEnv = process.env.NODE_ENV,
): string {
  return optionalApprovedOrigin(
    value,
    PUBLIC_RUNTIME_POLICY.stagingApiOrigin,
    "Web API origin",
    nodeEnv,
  );
}

export function webSupabaseOrigin(
  value = process.env.NEXT_PUBLIC_SUPABASE_URL,
  nodeEnv = process.env.NODE_ENV,
): string {
  return optionalApprovedOrigin(
    value,
    PUBLIC_RUNTIME_POLICY.stagingSupabaseOrigin,
    "Web Supabase origin",
    nodeEnv,
  );
}
