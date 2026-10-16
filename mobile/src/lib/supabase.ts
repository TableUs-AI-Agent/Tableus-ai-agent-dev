import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";
import { storage } from "./storage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(url || "https://not-configured.supabase.co", anonKey || "not-configured", {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
