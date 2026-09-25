import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router/stack";
import { router } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ConnectivityBanner } from "@/components/connectivity-banner";
import { AppProviders } from "@/providers/app-providers";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme";
import { pendingJoinStore } from "@/lib/pending-join";
import { sanitizeSentryEvent } from "@tableus/domain";

const telemetryMode = process.env.EXPO_PUBLIC_TELEMETRY_MODE;
if ((telemetryMode === "staging" || telemetryMode === "production") && process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: telemetryMode,
    release: process.env.EXPO_PUBLIC_SOURCE_SHA,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    profilesSampleRate: 0,
    maxBreadcrumbs: 0,
    beforeSend: (event) => sanitizeSentryEvent(event),
  });
}

function RootNavigator() {
  const auth = useAuth();
  useEffect(() => {
    if (!auth.approved || !auth.subject) return;
    const pending = pendingJoinStore.getSnapshot();
    if (pending?.subject !== auth.subject) return;
    // Approval may remove the auth modal; restore the explicit Join screen,
    // never submit the capability as a side effect of signing in.
    router.replace({ pathname: "/join/[id]", params: { id: pending.planId, pending: pending.handle } });
  }, [auth.approved, auth.subject]);
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ConnectivityBanner />
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal", contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Protected guard={!auth.approved && auth.phase !== "deletion"}>
          <Stack.Screen name="auth" options={{ title: "Invite access", presentation: "modal" }} />
        </Stack.Protected>
        <Stack.Protected guard={auth.phase !== "deletion"}>
          <Stack.Screen name="join/[id]" options={{ title: "Join plan" }} />
        </Stack.Protected>
        <Stack.Screen name="e2e/identity" options={{ title: "Local E2E identity" }} />
        <Stack.Screen name="e2e/connectivity" options={{ title: "Local connectivity" }} />
        <Stack.Screen name="e2e/auth" options={{ title: "Session check" }} />
        <Stack.Screen name="e2e/telemetry" options={{ title: "Telemetry check" }} />
        <Stack.Screen name="privacy" options={{ title: "Privacy" }} />
        <Stack.Screen name="account-deletion" options={{ title: "Account deletion" }} />
        <Stack.Screen name="terms" options={{ title: "Terms" }} />
        <Stack.Protected guard={auth.approved}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="plans/[id]" options={{ title: "Dinner plan" }} />
          <Stack.Screen name="e2e/account" options={{ title: "Account check" }} />
        </Stack.Protected>
        <Stack.Protected guard={auth.approved || auth.phase === "deletion"}>
          <Stack.Screen name="account" options={{ title: "Account and data" }} />
        </Stack.Protected>
      </Stack>
    </View>
  );
}

function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </AppProviders>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
