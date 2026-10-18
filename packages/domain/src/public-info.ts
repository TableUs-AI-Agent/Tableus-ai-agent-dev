export const PUBLIC_CONTACTS = {
  supportEmail: "brian@table-us.com",
  privacyEmail: "privacy@table-us.com",
} as const;

export const PUBLIC_POLICY_LINKS = {
  googleMapsPlatformTerms: "https://cloud.google.com/maps-platform/terms",
  googlePrivacyPolicy: "https://policies.google.com/privacy",
} as const;

/**
 * Public, non-secret trust anchors for hosted clients, one set per
 * environment. Hosted web builds must match their environment's set exactly.
 */
export const HOSTED_ENVIRONMENTS = {
  staging: {
    webOrigin: "https://staging.table-us.com",
    linkHost: "staging.table-us.com",
    apiOrigin: "https://api-staging-3795.up.railway.app",
    supabaseOrigin: "https://mrwdhdeubdiiydmmvlda.supabase.co",
  },
  production: {
    webOrigin: "https://www.table-us.com",
    linkHost: "links.table-us.com",
    apiOrigin: "https://api.table-us.com",
    // Set once the "TableUs Production" Supabase project exists. Until then
    // production web builds fail the origin check on purpose.
    supabaseOrigin: "",
  },
} as const;

export type HostedEnvironment = keyof typeof HOSTED_ENVIRONMENTS;

export function hostedEnvironment(value: string | undefined): HostedEnvironment {
  if (value === "staging" || value === "production") return value;
  throw new Error("TABLEUS_DEPLOY_ENV must be staging or production");
}

export const PUBLIC_RUNTIME_POLICY = {
  easProjectId: "0601c3b9-0082-454c-b636-45a1fe377f7b",
  linkHost: HOSTED_ENVIRONMENTS.production.linkHost,
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
