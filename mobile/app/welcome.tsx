import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { KeyboardAvoidingView, View } from "react-native";

import { Pip } from "@/components/pip";
import { TasteField } from "@/components/taste-field";
import { Body, Button, ErrorText, Field, Screen, Title } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { useSession } from "@/lib/session";
import { space } from "@/theme";

export default function Welcome() {
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
      <Screen>
        <View style={{ gap: space.sm, marginTop: space.xl }}>
          <Pip pose="wave" size={112} />
          <Title size={56}>Hi there</Title>
          <Body muted>Two quick things so your friends know it’s you.</Body>
        </View>
        <Field label="Your name" autoComplete="given-name" textContentType="givenName" maxLength={100} onChangeText={setName} />
        <TasteField value={taste} onChange={setTaste} />
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Button label="Continue" busy={busy} disabled={!name.trim()} onPress={save} />
        <Button label="Sign out" kind="quiet" onPress={signOut} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
