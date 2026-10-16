import { DarkerGrotesque_800ExtraBold, useFonts } from "@expo-google-fonts/darker-grotesque";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { SessionProvider, useMe, useSession } from "@/lib/session";
import { usePalette } from "@/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, retry: 1 } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Navigator />
      </SessionProvider>
    </QueryClientProvider>
  );
}

function Navigator() {
  const palette = usePalette();
  const [fontsLoaded] = useFonts({ DarkerGrotesque_800ExtraBold });
  const { session } = useSession();
  const me = useMe();

  const signedIn = session.status === "signed-in";
  // A failed profile read keeps the person inside so the screens can offer a retry.
  const resolved = session.status !== "loading" && (!signedIn || me.isFetched || me.isError);
  const ready = signedIn && (Boolean(me.data) || me.isError);
  const needsProfile = signedIn && me.data === null;

  useEffect(() => {
    if (fontsLoaded && resolved) SplashScreen.hideAsync();
  }, [fontsLoaded, resolved]);
  if (!fontsLoaded || !resolved) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerTintColor: palette.text,
          headerStyle: { backgroundColor: palette.background },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={needsProfile}>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={ready}>
          <Stack.Screen name="index" options={{ title: "Plans" }} />
          <Stack.Screen name="plan/[id]" options={{ title: "" }} />
          <Stack.Screen name="new-plan" options={{ presentation: "modal", title: "Start a plan" }} />
          <Stack.Screen name="wishes/[id]" options={{ presentation: "modal", title: "Your wishes" }} />
          <Stack.Screen name="account" options={{ title: "Account" }} />
        </Stack.Protected>
        <Stack.Screen name="join/[id]" options={{ title: "Join plan" }} />
      </Stack>
    </>
  );
}
