"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";

import { captureTelemetry, registerTelemetryClient, sanitizeWebPostHogPayload } from "./lib/telemetry";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 2 } } }),
  );

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const mode = process.env.NEXT_PUBLIC_TELEMETRY_MODE;
    if (!key || (mode !== "staging" && mode !== "production")) return;
    void import("posthog-js").then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        persistence: "memory",
        person_profiles: "never",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_feature_flags: true,
        advanced_disable_feature_flags_on_first_load: true,
        before_send: (payload) => payload ? sanitizeWebPostHogPayload(payload) : null,
      });
      registerTelemetryClient(posthog);
      captureTelemetry("app_opened");
    });
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
