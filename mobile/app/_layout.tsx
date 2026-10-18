import { DarkerGrotesque_800ExtraBold, useFonts } from "@expo-google-fonts/darker-grotesque";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { iconFonts } from "@/components/icon";
import { enableNotifications, notificationPlanId } from "@/lib/notifications";
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
  const [fontsLoaded] = useFonts({ DarkerGrotesque_800ExtraBold, ...iconFonts });
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
  usePlanNotifications(ready && session.status === "signed-in" ? session.subject : null);
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
          {/* The plans list draws its own display-face title, like the plan screen. */}
          <Stack.Screen name="index" options={{ title: "Plans", headerTitle: "" }} />
          <Stack.Screen name="plan/[id]" options={{ title: "" }} />
          <Stack.Screen name="new-plan" options={{ presentation: "modal", title: "Start a plan" }} />
          <Stack.Screen name="wishes/[id]" options={{ presentation: "modal", title: "" }} />
          <Stack.Screen name="account" options={{ title: "Account" }} />
        </Stack.Protected>
        <Stack.Screen name="join/[id]" options={{ title: "Join plan" }} />
      </Stack>
    </>
  );
}

/**
 * Keeps this phone's notifications pointed at the signed-in person, opens the
 * plan a tapped notification is about, and refreshes plans when one arrives.
 */
function usePlanNotifications(subject: string | null) {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!subject || Platform.OS === "web") return;
    enableNotifications(subject, false);
    const open = (response: Notifications.NotificationResponse | null) => {
      const planId = notificationPlanId(response);
      if (!planId) return;
      Notifications.clearLastNotificationResponse();
      router.push(`/plan/${planId}`);
    };
    // A tap that launched the app arrives before anyone is signed in.
    open(Notifications.getLastNotificationResponse());
    const tapped = Notifications.addNotificationResponseReceivedListener(open);
    const received = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["plan"] });
    });
    return () => {
      tapped.remove();
      received.remove();
    };
  }, [subject, router, queryClient]);
}
