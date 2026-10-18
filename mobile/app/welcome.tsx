import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { KeyboardAvoidingView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pip } from "@/components/pip";
import { TasteField } from "@/components/taste-field";
import { Body, Button, ErrorText, Field, Footer, Screen, Title } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { useSession } from "@/lib/session";
import { space, usePalette } from "@/theme";

export default function Welcome() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { signOut } = useSession();
  const [name, setName] = useState("");
  const [taste, setTaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const saved = await api.saveMe({ display_name: name.trim(), taste_profile: taste });
      queryClient.setQueryData(["me", saved.id], saved);
    } catch (failure) {
      setError(errorMessage(failure));
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <Screen
        padded={false}
        footer={
          <Footer>
            {error ? <ErrorText>{error}</ErrorText> : null}
            <Button label="Continue" busy={busy} disabled={!name.trim()} onPress={save} />
            <Button label="Sign out" kind="quiet" onPress={signOut} />
          </Footer>
        }
      >
        <View style={{ backgroundColor: palette.sky, paddingTop: insets.top + space.lg, alignItems: "center", borderBottomLeftRadius: 32, borderBottomRightRadius: 32, borderCurve: "continuous" }}>
          <Pip pose="wave" size={150} />
        </View>
        <View style={{ paddingHorizontal: space.lg, gap: space.lg }}>
          <View style={{ gap: space.sm }}>
            <Title size={48}>Nice to meet you</Title>
            <Body muted>Two quick things so your friends know it’s you and Pip knows what you like.</Body>
          </View>
          <Field label="Your name" icon="person" placeholder="First name is fine" autoComplete="given-name" textContentType="givenName" maxLength={100} onChangeText={setName} />
          <TasteField value={taste} onChange={setTaste} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
