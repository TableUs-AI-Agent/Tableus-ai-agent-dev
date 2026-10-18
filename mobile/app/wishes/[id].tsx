import type { Constraints } from "@tableus/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, View } from "react-native";

import { Body, Button, CancelButton, Card, Centered, ErrorText, Footer, Icon, Screen, Title } from "@/components/ui";
import { readWishes, WishesForm } from "@/components/wishes-form";
import { api, errorMessage } from "@/lib/api";
import { useKeys, useMe } from "@/lib/session";
import { space, usePalette } from "@/theme";

const ART = require("../../assets/art/spot-wishes.webp");

export default function Wishes() {
  const keys = useKeys();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const palette = usePalette();
  const queryClient = useQueryClient();
  const me = useMe();
  const plan = useQuery({ queryKey: keys.plan(id), queryFn: () => api.getPlan(id) });
  const [draft, setDraft] = useState<Constraints | null>(null);
  const save = useMutation({
    mutationFn: (wishes: Constraints) => api.saveConstraints(id, wishes),
    onSuccess: (next) => {
      queryClient.setQueryData(keys.plan(id), next);
      queryClient.invalidateQueries({ queryKey: keys.plans });
      router.back();
    },
  });

  if (!plan.data) return <Centered><ActivityIndicator color={palette.text} /></Centered>;
  const mine = plan.data.participants.find((person) => person.profile_id === me.data?.id);
  const initial = readWishes(mine?.constraints);
  const wishes = draft ?? initial;
  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerLeft: () => <CancelButton onPress={() => router.back()} /> }} />
      <Screen
        footer={
          <Footer>
            {save.isError ? <ErrorText>{errorMessage(save.error)}</ErrorText> : null}
            <Button label="Save my wishes" icon="checkmark" busy={save.isPending} onPress={() => save.mutate({ ...wishes, notes: wishes.notes?.trim() ?? "" })} />
          </Footer>
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <View style={{ flex: 1, gap: space.xs }}>
            <Title size={34}>What do you want?</Title>
            <Body muted>Everyone in {plan.data.title} sees this. Your standing tastes from your account count too.</Body>
          </View>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: palette.sky, alignItems: "center", justifyContent: "center" }}>
            <Image source={ART} style={{ width: 60, height: 60 }} contentFit="contain" accessible={false} />
          </View>
        </View>
        {plan.data.status === "voting" ? (
          <Card tone="tinted">
            <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start" }}>
              <Icon name="exclamationmark.triangle.fill" fallback="!" size={16} color={palette.accent} />
              <Body style={{ flex: 1 }}>Saving clears the current picks and everyone’s votes, so the group can get new ones.</Body>
            </View>
          </Card>
        ) : null}
        <WishesForm initial={initial} onChange={setDraft} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
