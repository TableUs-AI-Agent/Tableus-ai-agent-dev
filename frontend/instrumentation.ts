export async function register() {
  const mode = process.env.TABLEUS_TELEMETRY_MODE;
  if ((mode !== "staging" && mode !== "production") || !process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  const { sanitizeSentryEvent } = await import("@tableus/domain");
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: mode,
    release: process.env.TABLEUS_BUILD_SHA,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    maxBreadcrumbs: 0,
    beforeSend: (event) => sanitizeSentryEvent(event),
  });
}

export const onRequestError = async (...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>) => {
  const mode = process.env.TABLEUS_TELEMETRY_MODE;
  if (mode !== "staging" && mode !== "production") return;
  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(...args);
};
