/** Only follow same-site paths after sign-in, never an outside URL. */
export function safeNext(value: string | null, fallback = "/plans"): string {
  if (!value || !value.startsWith("/") || value.includes("\\")) return fallback;
  try {
    const base = "https://tableus.invalid";
    const resolved = new URL(value, base);
    if (resolved.origin !== base) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
