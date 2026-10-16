/** Only follow same-site paths after sign-in, never an outside URL. */
export function safeNext(value: string | null, fallback = "/plans"): string {
  if (!value || !value.startsWith("/") || value.includes("\\")) return fallback;
  try {
    const base = "https://tableus.invalid";
    const resolved = new URL(value, base);
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    // Normalization can turn "/a/..//evil.example" into a protocol-relative URL.
    if (resolved.origin !== base || path.startsWith("//")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}
