import { BETA_NOTICE_EFFECTIVE_DATE, mailto, PUBLIC_CONTACTS, PUBLIC_POLICY_LINKS } from "@tableus/domain";
import { Linking, ScrollView, Text } from "react-native";

import { colors } from "@/theme";

export default function PrivacyScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 14 }}>
      <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "800" }}>Closed-beta privacy notice</Text>
      <Text selectable style={{ color: colors.muted }}>Effective {BETA_NOTICE_EFFECTIVE_DATE}</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Data we process</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>TableUs processes account identifiers, a one-way email hash, display name, invite redemption, connections, reviews, optional taste preferences, plans, constraints, votes, audit events, and provider-usage totals. Supabase separately processes authentication email and sessions.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Photos, location, and providers</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Food photos are validated, resized, stripped of metadata, sent ephemerally to Google Gemini for analysis, and not stored by TableUs. Recommendation requests and group constraints, and review content used to create an optional taste summary, may also be sent to Google Gemini. Location queries are sent to Google Maps but not to telemetry. Google display data is refreshed rather than retained; TableUs stores Place IDs, the location label you entered, and its own planning metadata. Your entered plan location label is visible to plan participants.</Text>
      <Text accessibilityRole="link" onPress={() => Linking.openURL(PUBLIC_POLICY_LINKS.googlePrivacyPolicy)} style={{ color: colors.accent, fontWeight: "700" }}>Google Privacy Policy</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Analytics and sharing</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>During the beta, TableUs sends a small default-on set of anonymous aggregate product events to PostHog using a random in-memory session identifier that resets when the app process ends. We do not create analytics person profiles, persist an analytics identifier, use autocapture, collect location through analytics, or record sessions. Sentry receives sanitized unexpected errors only; messages, request bodies, headers, user fields, breadcrumbs, query strings, private URL segments, performance traces, profiling, replay, and attachments are excluded. Raw emails, reviews, queries, precise locations, photos, prompts, provider responses, and complete share tokens are excluded. Plan content is limited to approved participants and taste sharing is opt-in.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Your choices</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Account settings provide export and deletion controls. Organized plans must first be transferred or removed. TableUs is not intended for children under 13; do not submit sensitive medical information.</Text>
      <Text accessibilityRole="link" onPress={() => Linking.openURL(mailto(PUBLIC_CONTACTS.privacyEmail))} style={{ color: colors.accent, fontWeight: "700" }}>{PUBLIC_CONTACTS.privacyEmail}</Text>
    </ScrollView>
  );
}
