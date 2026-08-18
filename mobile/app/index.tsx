import { Redirect } from "expo-router";

import { isSupabaseConfigured } from "@/lib/supabase";

export default function Index() {
  return <Redirect href={isSupabaseConfigured ? "/auth" : "/(tabs)/plans"} />;
}
