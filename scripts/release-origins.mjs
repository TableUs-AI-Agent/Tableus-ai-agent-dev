export const RELEASE_ORIGINS = Object.freeze({
  stagingApi: "https://api-staging-3795.up.railway.app",
  stagingSupabase: "https://mrwdhdeubdiiydmmvlda.supabase.co",
  stagingLinks: "https://links.table-us.com",
  posthogApi: "https://us.posthog.com",
});

export function requireReleaseOrigin(value, expected, label) {
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.port
    || (parsed.pathname !== "/" && parsed.pathname !== "")
    || parsed.search
    || parsed.hash
    || parsed.origin !== expected
  ) throw new Error(`${label} must be the source-controlled release origin ${expected}`);
  return expected;
}
