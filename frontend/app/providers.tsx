"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 2 } } }),
  );

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    void import("posthog-js").then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        person_profiles: "identified_only",
        autocapture: false,
        capture_pageview: false,
        disable_session_recording: true,
      });
      posthog.capture("app_opened", { platform: "web" });
    });
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
