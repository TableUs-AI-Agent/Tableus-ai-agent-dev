/**
 * Service origins come from build-time env. Accept a bare HTTPS origin, or plain
 * HTTP on this machine for local development. Hosted builds are additionally
 * pinned to the expected staging origins in next.config.ts.
 */
export function serviceOrigin(value: string | undefined, label: string): string {
  if (!value) return "";
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be an origin like https://api.example.com`);
  }
  const local = parsed.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (
    (parsed.protocol !== "https:" && !local)
    || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash
  ) {
    throw new Error(`${label} must be an origin like https://api.example.com`);
  }
  return parsed.origin;
}

export const webApiOrigin = (value = process.env.NEXT_PUBLIC_API_URL) => serviceOrigin(value, "API origin");
export const webSupabaseOrigin = (value = process.env.NEXT_PUBLIC_SUPABASE_URL) =>
  serviceOrigin(value, "Supabase origin");
