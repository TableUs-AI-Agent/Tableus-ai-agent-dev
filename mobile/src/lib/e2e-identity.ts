import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { canUseLocalE2E, isLocalE2EIdentity, type LocalE2EIdentity } from "./e2e-config";

const identityKey = "tableus.local-e2e-identity";
const configuredDefault = process.env.EXPO_PUBLIC_DEMO_USER_ID;

export const localE2EEnabled = canUseLocalE2E({
  configEnabled: Constants.expoConfig?.extra?.localE2E === true,
  demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === "true",
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
});

export async function getLocalE2EIdentity(): Promise<LocalE2EIdentity> {
  const fallback = isLocalE2EIdentity(configuredDefault) ? configuredDefault : "demo-organizer";
  if (!localE2EEnabled) return fallback;
  const stored = await SecureStore.getItemAsync(identityKey);
  return isLocalE2EIdentity(stored) ? stored : fallback;
}

export async function setLocalE2EIdentity(identity: LocalE2EIdentity): Promise<void> {
  if (!localE2EEnabled || !isLocalE2EIdentity(identity)) {
    throw new Error("Local E2E identity switching is unavailable.");
  }
  await SecureStore.setItemAsync(identityKey, identity);
}

export function localE2EIdentityName(identity: LocalE2EIdentity): string {
  return identity === "demo-organizer" ? "Demo Organizer" : "Demo Guest";
}
