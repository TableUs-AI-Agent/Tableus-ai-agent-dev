import { Linking, ScrollView, Text } from "react-native";
import { colors } from "@/theme";

export default function PrivacyScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 14 }}>
      <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "800" }}>Closed-beta privacy notice</Text>
      <Text selectable style={{ color: colors.muted }}>Effective August 17, 2026</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Data we process</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>TableUs processes account identifiers, a one-way email hash, display name, invite redemption, connections, reviews, optional taste preferences, plans, constraints, votes, audit events, and provider-usage totals. Supabase separately processes authentication email and sessions.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Photos, location, and providers</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Food photos are validated, stripped of metadata, analyzed ephemerally, and not stored by TableUs. Search coordinates are not sent to telemetry. Live restaurant display data is refreshed from Google Maps; TableUs stores Place IDs and its own planning metadata.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Analytics and sharing</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Privacy-filtered events may be sent to PostHog and errors to Sentry. Raw emails, reviews, queries, precise locations, photos, prompts, provider responses, and complete share tokens are excluded. Plan content is limited to approved participants and taste sharing is opt-in.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Your choices</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Account settings provide export and deletion controls. Organized plans must first be transferred or removed. TableUs is not intended for children under 13; do not submit sensitive medical information.</Text>
      <Text accessibilityRole="link" onPress={() => Linking.openURL("mailto:privacy@tableus.app")} style={{ color: colors.accent, fontWeight: "700" }}>privacy@tableus.app</Text>
    </ScrollView>
  );
}
