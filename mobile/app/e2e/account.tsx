import Constants from "expo-constants";
import { Redirect } from "expo-router";
import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card } from "@/components/ui";
import { type AccountControl, summarizeAccountExport } from "@/lib/account-controls";
import { api } from "@/lib/api";
import { isAuthE2EEnabled } from "@/lib/auth-e2e-config";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors } from "@/theme";

const enabled = isAuthE2EEnabled({
  configFlag: Constants.expoConfig?.extra?.authE2E === true,
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === "true",
  supabaseConfigured: isSupabaseConfigured,
});

export default function AccountE2EScreen() {
  const [status, setStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [summary, setSummary] = useState("");

  if (!enabled) return <Redirect href="/" />;

  const validate = async () => {
    setStatus("running");
    setSummary("");
    try {
      const [exported, control] = await Promise.all([
        api.get<unknown>("/api/v1/me/export"),
        api.get<AccountControl>("/api/v1/me/account-control"),
      ]);
      const exportSummary = summarizeAccountExport(exported);
      if (!exportSummary.valid || control.deletion_scope !== "application_profile") {
        setStatus("failed");
        return;
      }
      setSummary(
        `${exportSummary.reviewCount} reviews, ${exportSummary.membershipCount} plan memberships, ${exportSummary.voteCount} votes; deletion ${control.can_delete ? "ready" : "blocked"}`,
      );
      setStatus("passed");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20 }}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>Account export check</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>
          This test-only control validates export structure and deletion readiness. It exposes aggregate counts only and never deletes data.
        </Text>
        <Button label="Validate account controls" onPress={() => void validate()} loading={status === "running"} />
        <Text selectable accessibilityRole="alert" accessibilityLabel={`Account control ${status}`} style={{ color: status === "failed" ? colors.danger : colors.accent, fontWeight: "700" }}>
          {status === "passed" ? "Account control validation passed" : status === "failed" ? "Account control validation failed" : "Account control validation not run"}
        </Text>
        {summary ? <Text selectable style={{ color: colors.muted }}>{summary}</Text> : null}
      </Card>
    </ScrollView>
  );
}
