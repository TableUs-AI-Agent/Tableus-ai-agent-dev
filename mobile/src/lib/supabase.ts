import "react-native-url-polyfill/auto";

import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE === "true";

export const secureAuthStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const isSupabaseConfigured = !demoMode && Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = createClient(
  supabaseUrl || "https://not-configured.supabase.co",
  supabaseAnonKey || "not-configured",
  {
    auth: {
      storage: secureAuthStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export async function getSupabaseAccessToken() {
  return (await supabase.auth.getSession()).data.session?.access_token ?? null;
}

export async function refreshSupabaseAccessToken() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    await supabase.auth.signOut({ scope: "local" });
    return null;
  }
  return data.session.access_token;
}
