import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { maskEmail, type AuthMode } from "@/lib/auth-transaction";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme";

export default function AuthScreen() {
  const auth = useAuth();
  const [mode, setMode] = useState<AuthMode>("join");
  const [invite, setInvite] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const awaitingCode = auth.phase === "pending_verification";
  const awaitingRedemption = auth.phase === "redeem_pending";
  const effectiveMode = auth.pending?.mode ?? mode;
  const joinMode = effectiveMode === "join";

  const begin = async () => {
    if (joinMode) await auth.beginJoin({ invite, email, displayName: name });
    else await auth.beginSignIn(email);
  };

  const switchMode = async () => {
    if (auth.pending) await auth.cancelPending();
    setMode(joinMode ? "sign-in" : "join");
    setInvite("");
    setEmail("");
    setName("");
    setCode("");
    auth.clearError();
  };

  const restart = async () => {
    await auth.cancelPending();
    setCode("");
  };

  const startDisabled = auth.busy || !email.trim() || (joinMode && (!invite.trim() || !name.trim()));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
      <Text selectable style={{ color: colors.ink, fontSize: 28, fontWeight: "800" }}>
        {joinMode ? "A better answer than “anything is fine.”" : "Welcome back."}
      </Text>
      <Text selectable style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>
        {joinMode
          ? "TableUs is an invite-only beta. Your invite is checked before an account can be created."
          : "Sign in with the email for your invite-approved TableUs account."}
      </Text>
      <Card>
        {awaitingCode || awaitingRedemption ? (
          <>
            <Text selectable accessibilityLabel="Verification email" style={{ color: colors.ink, fontWeight: "700" }}>
              Continue as {maskEmail(auth.pending?.email ?? "")}
            </Text>
            {awaitingCode ? (
              <>
                <Text selectable style={{ color: colors.muted, lineHeight: 21 }}>
                  Enter the complete code from the newest email. Code length can vary.
                </Text>
                <Field accessibilityLabel="Email verification code" value={code} onChangeText={setCode} placeholder="Email code" keyboardType="number-pad" autoComplete="one-time-code" />
                <Button label="Verify and continue" onPress={() => void auth.verifyCode(code)} loading={auth.busy} disabled={!code.trim()} />
              </>
            ) : (
              <>
                <Text selectable accessibilityRole="alert" style={{ color: colors.muted, lineHeight: 21 }}>
                  Your email is verified. Finish connecting your approved TableUs profile.
                </Text>
                <Button label="Retry profile approval" onPress={() => void auth.finishApproval()} loading={auth.busy} />
              </>
            )}
            {auth.error ? <ErrorText message={auth.error} /> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Start authentication again" onPress={() => void restart()}>
              <Text selectable style={{ color: colors.accent, fontWeight: "700", textAlign: "center", padding: 8 }}>Start again</Text>
            </Pressable>
          </>
        ) : (
          <>
            {joinMode ? <Field accessibilityLabel="Invite code" value={invite} onChangeText={setInvite} placeholder="Invite code" autoCapitalize="none" autoCorrect={false} /> : null}
            {joinMode ? <Field accessibilityLabel="Display name" value={name} onChangeText={setName} placeholder="Display name" autoComplete="name" /> : null}
            {isSupabaseConfigured ? <Field accessibilityLabel="Email address" value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" /> : null}
            {auth.error ? <ErrorText message={auth.error} /> : null}
            <Button label="Email me a code" onPress={() => void begin()} loading={auth.busy} disabled={startDisabled} />
            <Pressable accessibilityRole="button" onPress={() => void switchMode()}>
              <Text selectable style={{ color: colors.accent, fontWeight: "700", textAlign: "center", padding: 8 }}>
                {joinMode ? "Already joined? Sign in" : "Have a new invite? Join the beta"}
              </Text>
            </Pressable>
          </>
        )}
      </Card>
    </ScrollView>
  );
}
