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
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Food photos are validated, resized, stripped of metadata, sent ephemerally to Google Gemini for analysis, and not stored by TableUs. Recommendation requests and group constraints, and review content used to create an optional taste summary, may also be sent to Google Gemini. Location queries are sent to Google Maps but not to telemetry. Google display data is refreshed rather than retained; TableUs stores Place IDs, the location label you entered, and its own planning metadata. Your entered plan location label is visible to plan participants.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Analytics and sharing</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Privacy-filtered events may be sent to PostHog and errors to Sentry. Raw emails, reviews, queries, precise locations, photos, prompts, provider responses, and complete share tokens are excluded. Plan content is limited to approved participants and taste sharing is opt-in.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Your choices</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Account settings provide export and deletion controls. Organized plans must first be transferred or removed. TableUs is not intended for children under 13; do not submit sensitive medical information.</Text>
      <Text accessibilityRole="link" onPress={() => Linking.openURL("mailto:privacy@tableus.app")} style={{ color: colors.accent, fontWeight: "700" }}>privacy@tableus.app</Text>
    </ScrollView>
  );
}
