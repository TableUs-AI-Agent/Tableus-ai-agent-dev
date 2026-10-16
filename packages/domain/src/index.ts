import { validateJoinToken } from "./private-links.ts";

export type AuthLinkMode = "join" | "sign-in";

export function normalizeHttpsOrigin(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Link origin must be a valid HTTPS origin");
  }
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.port
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
  ) {
    throw new Error("Link origin must be HTTPS with no credentials, port, path, query, or fragment");
  }
  return parsed.origin;
}

export function buildJoinUrl(origin: string, planId: string, shareToken: string, format: "query" | "fragment" = "query"): string {
  validateJoinToken(shareToken);
  if (format !== "query" && format !== "fragment") throw new Error("Invalid private link format");
  const url = new URL(`/join/${requireCanonicalUuid(planId, "Plan ID")}`, normalizeHttpsOrigin(origin));
  if (format === "fragment") url.hash = new URLSearchParams({ token: shareToken }).toString();
  else url.searchParams.set("token", shareToken);
  return url.toString();
}

export function requireCanonicalUuid(value: string, label = "Identifier"): string {
  const normalized = value.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(normalized)) {
    throw new Error(`${label} must be a canonical UUID`);
  }
  return normalized;
}

export function buildAuthUrl(origin: string, mode: AuthLinkMode): string {
  const url = new URL("/auth", normalizeHttpsOrigin(origin));
  url.searchParams.set("mode", mode);
  return url.toString();
}

export * from "./telemetry.ts";
export * from "./public-info.ts";

export * from "./private-links.ts";
