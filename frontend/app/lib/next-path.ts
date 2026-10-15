/** Only follow same-site paths after sign-in, never an outside URL. */
export function safeNext(value: string | null, fallback = "/plans"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
