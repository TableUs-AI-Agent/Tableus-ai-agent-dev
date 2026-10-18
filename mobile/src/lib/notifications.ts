import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { api } from "./api";

/**
 * Phone notifications for the moments a plan needs the group: picks are ready
 * to vote on, and the plan is locked in. The server sends them through Expo.
 */
const supported = Platform.OS === "ios" || Platform.OS === "android";

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** The token this phone last saved, and whose account it was saved for. */
let saved: { token: string; subject: string } | null = null;

async function pushToken(): Promise<string> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Plans",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

/**
 * Point this phone's notifications at the signed-in person. With `ask`, shows
 * the system prompt if they haven't answered it yet; otherwise only refreshes
 * a permission they already gave.
 */
export async function enableNotifications(subject: string, ask: boolean): Promise<void> {
  if (!supported || saved?.subject === subject) return;
  try {
    let { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status !== "granted" && ask && canAskAgain) {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== "granted") return;
    const token = await pushToken();
    await api.savePushToken(token);
    saved = { token, subject };
  } catch {
    // Notifications are a nicety: the plan screen still refreshes on its own.
  }
}

/** Stop sending this person's notifications to this phone. Call before signing out. */
export async function disableNotifications(): Promise<void> {
  if (!supported) return;
  const token = saved?.token;
  saved = null;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (token || status === "granted") await api.removePushToken(token ?? await pushToken());
  } catch {
    // Already gone, or offline; the next person to sign in here takes the phone over.
  }
}

/** The plan a tapped notification is about. */
export function notificationPlanId(response: Notifications.NotificationResponse | null): string | null {
  const planId = response?.notification.request.content.data?.planId;
  return typeof planId === "string" ? planId : null;
}
