import { Image } from "expo-image";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SpotTile, type Spot } from "@/components/art";
import { Body, Button, ErrorText, Field, Footnote, IconTile, Title } from "@/components/ui";
import { DEMO_PEOPLE } from "@/lib/api";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { space, tiles, usePalette } from "@/theme";

const HERO = require("../assets/art/hero-table.webp");
const HERO_SKY = "#B4E9FD";

// The explainer uses the plush spot art, so the first screen shows the world the app lives in.
const STEPS: { spot: Spot; title: string; detail: string }[] = [
  { spot: "invite", title: "Share one link", detail: "Friends join from a text. No app needed on the web." },
  { spot: "wishes", title: "Everyone says what they want", detail: "Cravings, budget, allergies, in plain words." },
  { spot: "distance", title: "Get four places that fit", detail: "Real spots nearby, each with the reason it works." },
  { spot: "vote", title: "Vote and lock it in", detail: "Tap your top three. The organizer makes it official." },
];

export default function SignIn() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [step, setStep] = useState<"intro" | "email">("intro");
  const heroHeight = Math.min(width / 1.5, height * 0.3);

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" contentContainerStyle={{ flexGrow: 1, paddingBottom: space.md }}>
        {/* The art is a daytime scene, so its sky stays light in dark mode too. */}
        <View style={{ backgroundColor: HERO_SKY, paddingTop: insets.top }}>
          <Image
            source={HERO}
            contentFit="cover"
            style={{ width, height: heroHeight }}
            accessibilityIgnoresInvertColors
            accessible={false}
          />
        </View>
        <View style={{ flex: 1, paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.lg }}>
          <View style={{ gap: space.sm }}>
            <Title size={52}>Dinner, decided.</Title>
            <Body muted>TableUs finds where your group should eat, so nobody has to say “I don’t mind, you pick.”</Body>
          </View>
          {step === "intro" ? (
            <>
              <View style={{ gap: space.md }}>
                {STEPS.map((item) => (
                  <View key={item.title} style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
                    <SpotTile spot={item.spot} size={48} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: palette.text }}>{item.title}</Text>
                      <Text style={{ fontSize: 14, lineHeight: 19, color: palette.secondary }}>{item.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : isSupabaseConfigured ? (
            <EmailCode onBack={() => setStep("intro")} />
          ) : (
            <DemoPicker />
          )}
        </View>
      </ScrollView>
      {step === "intro" ? (
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: insets.bottom + space.sm, gap: space.sm }}>
          <Button label="Continue with email" icon="envelope.fill" onPress={() => setStep("email")} />
          <Footnote style={{ textAlign: "center" }}>New here? The same code signs you up.</Footnote>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

function EmailCode({ onBack }: { onBack: () => void }) {
  const palette = usePalette();
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
        <Field
          label="Email"
          icon="envelope"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          autoFocus
          onChangeText={setEmail}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Button label="Email me a code" busy={busy} disabled={!email.includes("@")} onPress={send} />
        <Button label="Back" kind="quiet" onPress={onBack} />
      </View>
    );
  }
  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
        <IconTile name="envelope.badge.fill" color={tiles.radicchio} size={40} />
        <Text style={{ flex: 1, fontSize: 16, lineHeight: 22, color: palette.text }}>
          We sent a six-digit code to <Text style={{ fontWeight: "700" }}>{sentTo}</Text>.
        </Text>
      </View>
      <Field
        label="Code"
        icon="number"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={10}
        onChangeText={setCode}
        style={{ fontSize: 26, letterSpacing: 8, fontVariant: ["tabular-nums"] }}
        autoFocus
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
      <Button label="Sign in" busy={busy} disabled={code.trim().length < 6} onPress={verify} />
      <Button label="Use a different email" kind="quiet" onPress={() => { setSentTo(null); setCode(""); }} />
    </View>
  );
}

function DemoPicker() {
  const { signInDemo } = useSession();
  return (
    <View style={{ gap: space.sm }}>
      <Footnote>Local development: pick a demo person.</Footnote>
      {DEMO_PEOPLE.map((person) => (
        <Button key={person.id} kind="secondary" icon="person.fill" label={`Continue as ${person.name}`} onPress={() => signInDemo(person.id)} />
      ))}
    </View>
  );
}
