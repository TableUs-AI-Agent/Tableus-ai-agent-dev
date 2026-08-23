import Constants from "expo-constants";
import { Redirect } from "expo-router";
import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { isAuthE2EEnabled } from "@/lib/auth-e2e-config";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { colors } from "@/theme";

const enabled = isAuthE2EEnabled({
  configFlag: Constants.expoConfig?.extra?.authE2E === true,
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === "true",
  supabaseConfigured: isSupabaseConfigured,
});

export default function AuthE2EScreen() {
  const [status, setStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");

  if (!enabled) return <Redirect href="/" />;

  const refresh = async () => {
    setStatus("running");
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      setStatus("failed");
      return;
    }
    try {
      await api.get("/api/v1/me");
      setStatus("passed");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20 }}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>Authenticated session check</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>
          This test-only control refreshes the current session and validates the approved profile. It never displays credentials.
        </Text>
        <Button label="Refresh authenticated session" onPress={() => void refresh()} loading={status === "running"} />
        <Text selectable accessibilityRole="alert" accessibilityLabel={`Session refresh ${status}`} style={{ color: status === "failed" ? colors.danger : colors.accent, fontWeight: "700" }}>
          {status === "passed" ? "Session refresh passed" : status === "failed" ? "Session refresh failed" : "Session refresh not run"}
        </Text>
      </Card>
    </ScrollView>
  );
}
