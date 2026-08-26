import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { Redirect } from "expo-router";
import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { isTelemetryE2EEnabled } from "@/lib/telemetry-e2e-config";
import { captureTelemetry } from "@/lib/telemetry";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors } from "@/theme";

const enabled = isTelemetryE2EEnabled({
  configFlag: Constants.expoConfig?.extra?.telemetryE2E === true,
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === "true",
  telemetryMode: process.env.EXPO_PUBLIC_TELEMETRY_MODE,
  supabaseConfigured: isSupabaseConfigured,
});

export default function TelemetryE2EScreen() {
  const [status, setStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  if (!enabled) return <Redirect href="/" />;
  const send = async () => {
    setStatus("running");
    const analyticsAccepted = captureTelemetry("telemetry_e2e", { component: "mobile" });
    Sentry.captureException(new Error("TableUs sanitized telemetry canary"));
    try {
      await api.post("/api/v1/e2e/telemetry");
      setStatus(analyticsAccepted ? "passed" : "failed");
    } catch {
      setStatus("failed");
    }
  };
  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20 }}><Card><Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>Staging telemetry check</Text><Text selectable style={{ color: colors.muted }}>This sends anonymous allowlisted canaries only. It never displays credentials or private product data.</Text><Button label="Send sanitized telemetry checks" onPress={() => void send()} loading={status === "running"} /><Text selectable accessibilityRole="alert" style={{ color: status === "failed" ? colors.danger : colors.accent }}>{status === "passed" ? "Telemetry checks passed" : status === "failed" ? "Telemetry checks failed" : "Telemetry checks not sent"}</Text></Card></ScrollView>;
}
