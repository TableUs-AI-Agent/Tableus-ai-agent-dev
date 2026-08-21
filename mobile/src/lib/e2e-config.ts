export const localE2EIdentities = ["demo-organizer", "demo-guest"] as const;

export type LocalE2EIdentity = (typeof localE2EIdentities)[number];

export function isLocalE2EIdentity(value: unknown): value is LocalE2EIdentity {
  return typeof value === "string" && localE2EIdentities.includes(value as LocalE2EIdentity);
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

export function canUseLocalE2E({
  configEnabled,
  demoMode,
  apiUrl,
}: {
  configEnabled: boolean;
  demoMode: boolean;
  apiUrl: string | undefined;
}): boolean {
  return configEnabled && demoMode && isLoopbackApiUrl(apiUrl);
}
