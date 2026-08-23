export type LocalE2EIdentity = string;

export function parseLocalE2EIdentities(value: string | undefined): readonly string[] {
  return (value ?? "").split(",").map((identity) => identity.trim()).filter(Boolean);
}

export function isAllowedLocalE2EIdentity(value: unknown, identities: readonly string[]): value is LocalE2EIdentity {
  return typeof value === "string" && identities.includes(value);
}

export function isLoopbackApiUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const hostname = new URL(value).hostname;
    return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "[::1]";
  } catch {
    return false;
  }
}

export function canUseLocalE2E({ configEnabled, demoMode, apiUrl }: { configEnabled: boolean; demoMode: boolean; apiUrl: string | undefined }): boolean {
  return configEnabled && demoMode && isLoopbackApiUrl(apiUrl);
}
