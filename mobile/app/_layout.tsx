import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/providers/app-providers";
import { colors } from "@/theme";

if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, sendDefaultPii: false });
}

function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal", contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ title: "Invite access", presentation: "modal" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="plans/[id]" options={{ title: "Dinner plan" }} />
        <Stack.Screen name="join/[id]" options={{ title: "Join plan" }} />
        <Stack.Screen name="e2e/identity" options={{ title: "Local E2E identity" }} />
        <Stack.Screen name="account" options={{ title: "Account and data" }} />
        <Stack.Screen name="privacy" options={{ title: "Privacy" }} />
        <Stack.Screen name="terms" options={{ title: "Terms" }} />
      </Stack>
    </AppProviders>
  );
}

export default Sentry.wrap(RootLayout);
