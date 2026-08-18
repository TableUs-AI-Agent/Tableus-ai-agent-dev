import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type PropsWithChildren, useEffect, useState } from "react";
import { AppState } from "react-native";
import { PostHogProvider, usePostHog } from "posthog-react-native";

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
);

function TelemetryBootstrap({ children }: PropsWithChildren) {
  const posthog = usePostHog();
  useEffect(() => {
    posthog.capture("app_opened", { platform: "mobile" });
  }, [posthog]);
  return children;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 2, networkMode: "online" },
          mutations: { retry: 0, networkMode: "always" },
        },
      }),
  );

  useEffect(
    () => AppState.addEventListener("change", (state) => focusManager.setFocused(state === "active")).remove,
    [],
  );

  const content = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) return content;
  return (
    <PostHogProvider
      apiKey={posthogKey}
      autocapture={false}
      options={{
        host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        persistence: "memory",
        captureAppLifecycleEvents: false,
        enableSessionReplay: false,
        setDefaultPersonProperties: false,
      }}
    >
      <TelemetryBootstrap>{content}</TelemetryBootstrap>
    </PostHogProvider>
  );
}
