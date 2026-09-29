import { ACCOUNT_DELETION_HELP, mailto, PUBLIC_CONTACTS } from "@tableus/domain";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, ScrollView, Text } from "react-native";

import { colors } from "@/theme";

const heading = { color: colors.ink, fontSize: 18, fontWeight: "700" as const };
const paragraph = { color: colors.muted, lineHeight: 23 };
const link = { color: colors.accent, fontWeight: "700" as const };

export default function AccountDeletionScreen() {
  const [emailError, setEmailError] = useState(false);
  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 14 }}>
    <Text selectable accessibilityRole="header" style={{ color: colors.ink, fontSize: 24, fontWeight: "800" }}>Request account deletion</Text>
    <Text selectable style={paragraph}>You can request deletion even if you cannot sign in or no longer have the app.</Text>
    <Text selectable accessibilityRole="header" style={heading}>Request by email</Text>
    <Text selectable style={paragraph}>{ACCOUNT_DELETION_HELP.request}</Text>
    <Text accessibilityRole="link" onPress={() => { setEmailError(false); void Linking.openURL(mailto(PUBLIC_CONTACTS.privacyEmail)).catch(() => setEmailError(true)); }} style={link}>Email {PUBLIC_CONTACTS.privacyEmail}</Text>
    <Text selectable style={paragraph}>If an email app does not open, copy this address: {PUBLIC_CONTACTS.privacyEmail}</Text>
    {emailError ? <Text accessibilityRole="alert" selectable style={paragraph}>Could not open an email app. Copy the address above to contact us.</Text> : null}
    <Text selectable style={paragraph}>{ACCOUNT_DELETION_HELP.acknowledgment}</Text>
    <Text selectable style={paragraph}>{ACCOUNT_DELETION_HELP.accessLoss}</Text>
    <Text selectable accessibilityRole="header" style={heading}>Request in the app</Text>
    <Text selectable style={paragraph}>{ACCOUNT_DELETION_HELP.inApp}</Text>
    <Text accessibilityRole="link" onPress={() => router.push("/account")} style={link}>Open Account and data</Text>
    <Text selectable accessibilityRole="header" style={heading}>What happens to shared content</Text>
    <Text selectable style={paragraph}>{ACCOUNT_DELETION_HELP.shared}</Text>
    <Text selectable accessibilityRole="header" style={heading}>Request status and retained records</Text>
    <Text selectable style={paragraph}>{ACCOUNT_DELETION_HELP.pending}</Text>
    <Text selectable style={paragraph}>{ACCOUNT_DELETION_HELP.limits}</Text>
    <Text accessibilityRole="link" onPress={() => router.push("/privacy")} style={link}>Read the privacy notice</Text>
  </ScrollView>;
}
