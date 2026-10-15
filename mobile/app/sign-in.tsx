import { useState } from "react";
import { KeyboardAvoidingView, View } from "react-native";

import { Body, Button, ErrorText, Field, Screen, Title } from "@/components/ui";
import { DEMO_PEOPLE } from "@/lib/api";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { space } from "@/theme";

export default function SignIn() {
  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <Screen>
        <View style={{ gap: space.sm, marginTop: space.xxl }}>
          <Title size={64}>Dinner, decided.</Title>
          <Body muted>Share one link. Everyone says what they want. Get four places that work for the whole group.</Body>
        </View>
        {isSupabaseConfigured ? <EmailCode /> : <DemoPicker />}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function EmailCode() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setError(null);
    const address = email.trim().toLowerCase();
    const { error: failure } = await supabase.auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } });
    setBusy(false);
    if (failure) setError("Couldn't send a code to that address. Check it and try again.");
    else setSentTo(address);
  }

  async function verify() {
    if (!sentTo) return;
    setBusy(true);
    setError(null);
    const { error: failure } = await supabase.auth.verifyOtp({ email: sentTo, token: code.trim(), type: "email" });
    setBusy(false);
    // On success the session listener moves the person on to setup or their plans.
    if (failure) setError("That code didn't work. Check the latest email, or send a new code.");
  }

  if (!sentTo) {
    return (
      <View style={{ gap: space.md }}>
        <Field label="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" onChangeText={setEmail} onSubmitEditing={send} returnKeyType="send" />
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Button label="Email me a code" busy={busy} disabled={!email.includes("@")} onPress={send} />
      </View>
    );
  }
  return (
    <View style={{ gap: space.md }}>
      <Body>We sent a six-digit code to {sentTo}.</Body>
      <Field label="Code" keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={10} onChangeText={setCode} style={{ fontSize: 28, letterSpacing: 8 }} autoFocus />
      {error ? <ErrorText>{error}</ErrorText> : null}
      <Button label="Sign in" busy={busy} disabled={code.trim().length < 6} onPress={verify} />
      <Button label="Use a different email" kind="quiet" onPress={() => { setSentTo(null); setCode(""); }} />
    </View>
  );
}

function DemoPicker() {
  const { signInDemo } = useSession();
  return (
    <View style={{ gap: space.md }}>
      <Body muted>Local development: pick a demo person.</Body>
      {DEMO_PEOPLE.map((person) => (
        <Button key={person.id} kind="quiet" label={`Continue as ${person.name}`} onPress={() => signInDemo(person.id)} />
      ))}
    </View>
  );
}
