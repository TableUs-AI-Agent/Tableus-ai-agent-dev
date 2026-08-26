export const PUBLIC_CONTACTS = {
  supportEmail: "support@table-us.com",
  privacyEmail: "privacy@table-us.com",
} as const;

export const PUBLIC_POLICY_LINKS = {
  googleMapsPlatformTerms: "https://cloud.google.com/maps-platform/terms",
  googlePrivacyPolicy: "https://policies.google.com/privacy",
} as const;

export const BETA_NOTICE_EFFECTIVE_DATE = "August 26, 2026";

export function mailto(email: string): string {
  return `mailto:${email}`;
}
