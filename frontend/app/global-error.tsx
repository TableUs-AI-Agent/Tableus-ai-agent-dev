"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const mode = process.env.NEXT_PUBLIC_TELEMETRY_MODE;
    if (mode === "staging" || mode === "production") Sentry.captureException(error);
  }, [error]);
  return (
    <html>
      <body>
        <main className="mx-auto max-w-xl px-6 py-20">
          <h1>TableUs hit an unexpected error.</h1>
          <p>Your private plan details were not included in the error report.</p>
          <button type="button" onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  );
}
