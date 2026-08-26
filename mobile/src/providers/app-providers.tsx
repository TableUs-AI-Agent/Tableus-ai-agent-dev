import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type PropsWithChildren, useEffect, useState } from "react";
import { AppState } from "react-native";
import { PostHogProvider, usePostHog } from "posthog-react-native";

import { ConnectivityProvider } from "@/providers/connectivity-provider";
import { captureTelemetry, registerTelemetryClient, sanitizeMobilePostHogPayload } from "@/lib/telemetry";

function TelemetryBootstrap({ children }: PropsWithChildren) {
  const posthog = usePostHog();
  useEffect(() => {
    registerTelemetryClient(posthog);
    captureTelemetry("app_opened");
  }, [posthog]);
  return children;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: Infinity,
            retry: 2,
            networkMode: "online",
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
          },
          mutations: { retry: 0, networkMode: "always" },
        },
      }),
  );

  useEffect(
    () => AppState.addEventListener("change", (state) => focusManager.setFocused(state === "active")).remove,
    [],
  );

  const content = (
    <ConnectivityProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConnectivityProvider>
  );
  const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  const telemetryMode = process.env.EXPO_PUBLIC_TELEMETRY_MODE;
  if (!posthogKey || (telemetryMode !== "staging" && telemetryMode !== "production")) return content;
  return (
    <PostHogProvider
      apiKey={posthogKey}
      autocapture={false}
      options={{
        host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        persistence: "memory",
        personProfiles: "never",
        captureAppLifecycleEvents: false,
        enableSessionReplay: false,
        setDefaultPersonProperties: false,
        disableGeoip: true,
        disableRemoteFeatureFlags: true,
        disableSurveys: true,
        before_send: ((payload: any) => payload ? sanitizeMobilePostHogPayload(payload) : null) as any,
      }}
    >
      <TelemetryBootstrap>{content}</TelemetryBootstrap>
    </PostHogProvider>
  );
}
