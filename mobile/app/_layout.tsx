import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ConnectivityBanner } from "@/components/connectivity-banner";
import { AppProviders } from "@/providers/app-providers";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme";

if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, sendDefaultPii: false });
}

function RootNavigator() {
  const auth = useAuth();
  const signedOut = auth.phase !== "loading" && !auth.approved;
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ConnectivityBanner />
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal", contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Protected guard={signedOut}>
          <Stack.Screen name="auth" options={{ title: "Invite access", presentation: "modal" }} />
        </Stack.Protected>
        <Stack.Screen name="join/[id]" options={{ title: "Join plan" }} />
        <Stack.Screen name="e2e/identity" options={{ title: "Local E2E identity" }} />
        <Stack.Screen name="e2e/connectivity" options={{ title: "Local connectivity" }} />
        <Stack.Screen name="e2e/auth" options={{ title: "Session check" }} />
        <Stack.Screen name="privacy" options={{ title: "Privacy" }} />
        <Stack.Screen name="terms" options={{ title: "Terms" }} />
        <Stack.Protected guard={auth.approved}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="plans/[id]" options={{ title: "Dinner plan" }} />
          <Stack.Screen name="account" options={{ title: "Account and data" }} />
          <Stack.Screen name="e2e/account" options={{ title: "Account check" }} />
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
