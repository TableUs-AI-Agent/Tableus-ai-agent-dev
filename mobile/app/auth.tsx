import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { api } from "@/lib/api";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { colors } from "@/theme";

const redemptionKey = "tableus.invite-redemption";

export default function AuthScreen() {
  const [invite, setInvite] = useState("tableus-beta");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const begin = async () => {
    setBusy(true);
    setError("");
    try {
      const validated = await api.post<{ redemption_token: string }>("/api/v1/access/validate", {
        code: invite,
        email: isSupabaseConfigured ? email : undefined,
      });
      await SecureStore.setItemAsync(redemptionKey, validated.redemption_token);
      if (!isSupabaseConfigured) {
        await api.post("/api/v1/access/redeem", { redemption_token: validated.redemption_token, display_name: name || "Demo Organizer" });
        router.replace("/(tabs)/plans");
        return;
      }
      const redirectTo = Linking.createURL("auth");
      const { error: otpError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (otpError) throw otpError;
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start sign in.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError("");
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
      if (verifyError) throw verifyError;
      const redemptionToken = await SecureStore.getItemAsync(redemptionKey);
      if (!redemptionToken) throw new Error("Invite validation expired. Start again.");
      await api.post("/api/v1/access/redeem", { redemption_token: redemptionToken, display_name: name });
      await SecureStore.deleteItemAsync(redemptionKey);
      router.replace("/(tabs)/plans");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
      <Text selectable style={{ color: colors.ink, fontSize: 28, fontWeight: "800" }}>A better answer than “anything is fine.”</Text>
      <Text selectable style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>TableUs is currently an invite-only beta. Your invite is checked before any sign-in email is sent.</Text>
      <Card>
        <Field value={invite} onChangeText={setInvite} placeholder="Invite code" autoCapitalize="none" />
        <Field value={name} onChangeText={setName} placeholder="Display name" autoComplete="name" />
        {isSupabaseConfigured ? <Field value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" /> : null}
        {sent ? <Field value={otp} onChangeText={setOtp} placeholder="Email code" keyboardType="number-pad" autoComplete="one-time-code" /> : null}
        {error ? <ErrorText message={error} /> : null}
        <Button label={sent ? "Verify and continue" : isSupabaseConfigured ? "Email me a code" : "Continue in demo mode"} onPress={sent ? verify : begin} loading={busy} disabled={!invite || !name || (isSupabaseConfigured && !email)} />
      </Card>
    </ScrollView>
  );
}
