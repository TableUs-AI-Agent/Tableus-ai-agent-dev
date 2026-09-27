export const PUBLIC_CONTACTS = {
  supportEmail: "support@table-us.com",
  privacyEmail: "privacy@table-us.com",
} as const;

export const PUBLIC_POLICY_LINKS = {
  googleMapsPlatformTerms: "https://cloud.google.com/maps-platform/terms",
  googlePrivacyPolicy: "https://policies.google.com/privacy",
} as const;

/**
 * Public, non-secret trust anchors for closed-beta hosted clients.
 *
 * Production endpoints are intentionally absent until the separately gated
 * production-release packet adds and reviews them in source.
 */
export const PUBLIC_RUNTIME_POLICY = {
  easProjectId: "0601c3b9-0082-454c-b636-45a1fe377f7b",
  linkHost: "links.table-us.com",
  stagingApiOrigin: "https://api-staging-3795.up.railway.app",
  stagingSupabaseOrigin: "https://mrwdhdeubdiiydmmvlda.supabase.co",
} as const;

export function requireExactHttpsOrigin(
  value: string,
  expected: string,
  label: string,
): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be the approved HTTPS origin`);
  }
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.port
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
    || parsed.origin !== expected
  ) {
    throw new Error(`${label} must equal the approved HTTPS origin`);
  }
  return parsed.origin;
}

export const BETA_NOTICE_EFFECTIVE_DATE = "August 26, 2026";

export function mailto(email: string): string {
  return `mailto:${email}`;
}
