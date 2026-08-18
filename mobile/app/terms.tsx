import { Linking, ScrollView, Text } from "react-native";
import { colors } from "@/theme";

export default function TermsScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 14 }}>
      <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "800" }}>Closed-beta terms</Text>
      <Text selectable style={{ color: colors.muted }}>Effective August 17, 2026</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Use is limited to approved beta accounts. Protect private plan links, do not distribute invites publicly, and report unauthorized access.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Acceptable use</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Do not abuse authentication, scrape provider data, probe another user&apos;s plans, upload unlawful content, or interfere with the service.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Dining and AI limitations</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>Recommendations and photo analyses are planning suggestions. TableUs does not guarantee allergy or dietary safety, ingredients, availability, pricing, hours, accessibility, reservations, or the accuracy of AI and third-party restaurant information. Confirm important facts with the restaurant.</Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Beta availability</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 23 }}>The beta is provided as available and may contain errors. Features, data, and access may change or end to protect users and the service. These terms require legal review before a broader public release.</Text>
      <Text accessibilityRole="link" onPress={() => Linking.openURL("mailto:support@tableus.app")} style={{ color: colors.accent, fontWeight: "700" }}>support@tableus.app</Text>
    </ScrollView>
  );
}
