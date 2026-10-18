import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Linking, Text, View } from "react-native";

import { TasteField } from "@/components/taste-field";
import { Avatar, Button, Card, ErrorText, Field, ListRow, ListSection, Screen } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { useMe, useSession } from "@/lib/session";
import { space, textScale, tiles, usePalette } from "@/theme";

const WEB = process.env.EXPO_PUBLIC_WEB_URL ?? "https://table-us.com";

export default function Account() {
  const palette = usePalette();
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
  const dirty = name.trim() !== (me.data?.display_name ?? "") || taste !== (me.data?.taste_profile ?? "");

  function confirmDelete() {
    Alert.alert(
      "Delete your account?",
      "This removes your profile, wishes and votes. Plans you started with others move to the next person who joined.",
      [{ text: "Cancel", style: "cancel" }, { text: "Delete account", style: "destructive", onPress: () => remove.mutate() }],
    );
  }

  return (
    <Screen>
      <View style={{ alignItems: "center", gap: space.sm, paddingTop: space.sm }}>
        <Avatar name={name || "?"} size={84} />
        <Text maxFontSizeMultiplier={textScale.display} style={{ fontSize: 24, fontWeight: "700", color: palette.text, textAlign: "center" }}>{name || "Your profile"}</Text>
      </View>

      <Card>
        <Field label="Your name" icon="person" defaultValue={name} maxLength={100} onChangeText={setName} />
        <TasteField value={taste} onChange={setTaste} />
        {save.isError ? <ErrorText>{errorMessage(save.error)}</ErrorText> : null}
        <Button
          label={save.isSuccess && !dirty ? "Saved" : "Save changes"}
          icon={save.isSuccess && !dirty ? "checkmark" : undefined}
          kind={dirty ? "primary" : "secondary"}
          busy={save.isPending}
          disabled={!name.trim() || !dirty}
          onPress={() => save.mutate()}
        />
      </Card>

      <ListSection title="About">
        <ListRow icon="hand.raised.fill" tint={tiles.sky} title="Privacy" accessory="external" onPress={() => Linking.openURL(`${WEB}/privacy`)} />
        <ListRow icon="doc.text.fill" tint={tiles.slate} title="Terms" accessory="external" onPress={() => Linking.openURL(`${WEB}/terms`)} />
      </ListSection>

      <ListSection>
        <ListRow icon="rectangle.portrait.and.arrow.right" tint={tiles.bottle} title="Sign out" accessory="none" onPress={signOut} />
      </ListSection>

      <ListSection footer="Takes effect right away and signs you out.">
        <ListRow icon="trash.fill" tint={tiles.radicchio} title="Delete account" destructive accessory="none" busy={remove.isPending} onPress={confirmDelete} />
      </ListSection>
      {remove.isError ? <ErrorText>{errorMessage(remove.error)}</ErrorText> : null}
    </Screen>
  );
}
