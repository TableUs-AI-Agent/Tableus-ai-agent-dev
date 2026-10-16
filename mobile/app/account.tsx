import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Linking, View } from "react-native";

import { TasteField } from "@/components/taste-field";
import { Body, Button, ErrorText, Field, Heading, Screen } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { useMe, useSession } from "@/lib/session";
import { space } from "@/theme";

const WEB = process.env.EXPO_PUBLIC_WEB_URL ?? "https://table-us.com";

export default function Account() {
  const me = useMe();
  const { signOut } = useSession();
  const queryClient = useQueryClient();
  const [name, setName] = useState(me.data?.display_name ?? "");
  const [taste, setTaste] = useState(me.data?.taste_profile ?? "");

  const save = useMutation({
    mutationFn: () => api.saveMe({ display_name: name.trim(), taste_profile: taste }),
    onSuccess: (saved) => queryClient.setQueryData(["me", saved.id], saved),
  });
  const remove = useMutation({ mutationFn: () => api.deleteAccount(me.data?.id ?? ""), onSuccess: signOut });

  function confirmDelete() {
    Alert.alert(
      "Delete your account?",
      "This removes your profile, wishes and votes. Plans you started with others move to the next person who joined.",
      [{ text: "Cancel", style: "cancel" }, { text: "Delete account", style: "destructive", onPress: () => remove.mutate() }],
    );
  }

  return (
    <Screen>
      <Field label="Your name" defaultValue={name} maxLength={100} onChangeText={setName} />
      <TasteField value={taste} onChange={setTaste} />
      {save.isError ? <ErrorText>{errorMessage(save.error)}</ErrorText> : null}
      <Button label={save.isSuccess ? "Saved" : "Save changes"} busy={save.isPending} disabled={!name.trim()} onPress={() => save.mutate()} />

      <View style={{ gap: space.sm, marginTop: space.lg }}>
        <Button kind="quiet" label="Sign out" onPress={signOut} />
        <Button kind="quiet" label="Privacy" onPress={() => Linking.openURL(`${WEB}/privacy`)} />
        <Button kind="quiet" label="Terms" onPress={() => Linking.openURL(`${WEB}/terms`)} />
      </View>

      <View style={{ gap: space.sm, marginTop: space.lg }}>
        <Heading>Delete your account</Heading>
        <Body muted>Takes effect right away and signs you out.</Body>
        {remove.isError ? <ErrorText>{errorMessage(remove.error)}</ErrorText> : null}
        <Button kind="danger" label="Delete my account" busy={remove.isPending} onPress={confirmDelete} />
      </View>
    </Screen>
  );
}
