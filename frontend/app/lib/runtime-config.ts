import { PUBLIC_RUNTIME_POLICY, requireExactHttpsOrigin } from "@tableus/domain";

function localDevelopmentOrigin(value: string): string | null {
  if (process.env.NODE_ENV === "production") return null;
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

function optionalApprovedOrigin(value: string | undefined, expected: string, label: string): string {
  if (!value) return "";
  return localDevelopmentOrigin(value) ?? requireExactHttpsOrigin(value, expected, label);
}

export function webApiOrigin(value = process.env.NEXT_PUBLIC_API_URL): string {
  return optionalApprovedOrigin(value, PUBLIC_RUNTIME_POLICY.stagingApiOrigin, "Web API origin");
}

export function webSupabaseOrigin(value = process.env.NEXT_PUBLIC_SUPABASE_URL): string {
  return optionalApprovedOrigin(
    value,
    PUBLIC_RUNTIME_POLICY.stagingSupabaseOrigin,
    "Web Supabase origin",
  );
}
