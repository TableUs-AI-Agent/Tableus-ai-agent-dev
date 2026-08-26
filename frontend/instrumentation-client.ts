import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryEvent } from "@tableus/domain";

const telemetryMode = process.env.NEXT_PUBLIC_TELEMETRY_MODE;
if ((telemetryMode === "staging" || telemetryMode === "production") && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: telemetryMode,
    release: process.env.NEXT_PUBLIC_SOURCE_SHA,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    maxBreadcrumbs: 0,
    beforeSend: (event) => sanitizeSentryEvent(event),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
