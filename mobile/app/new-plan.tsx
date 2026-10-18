import type { ResolvedLocation } from "@tableus/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Text, View } from "react-native";

import { Body, Button, CancelButton, Card, ErrorText, Field, Footer, Footnote, Icon, Screen } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { useKeys } from "@/lib/session";
import { space, usePalette } from "@/theme";

const ART = require("../assets/art/spot-distance.webp");
const GOOGLE_MAPS = require("../assets/google-maps-attribution.svg");

export default function NewPlan() {
  const keys = useKeys();
  const palette = usePalette();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<ResolvedLocation | null>(null);

  const find = useMutation({ mutationFn: () => api.resolveLocation(query.trim()), onSuccess: setLocation });
  const create = useMutation({
    mutationFn: (place: ResolvedLocation) => api.createPlan({
      title: title.trim() || "Dinner",
      location_label: place.label,
      location_place_id: place.place_id,
    }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: keys.plans });
      queryClient.setQueryData(keys.plan(created.plan.id), created.plan);
      // The sheet closes and the new plan opens on top of the list.
      router.dismiss();
      router.push(`/plan/${created.plan.id}`);
    },
  });
  const error = find.error ?? create.error;

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerLeft: () => <CancelButton onPress={() => router.back()} /> }} />
      <Screen
        footer={
          <Footer>
            {error ? <ErrorText>{errorMessage(error)}</ErrorText> : null}
            {location ? (
              <Button label="Start plan" icon="arrow.right" busy={create.isPending} onPress={() => create.mutate(location)} />
            ) : (
              <Button label="Find this place" icon="magnifyingglass" busy={find.isPending} disabled={query.trim().length < 2} onPress={() => find.mutate()} />
            )}
          </Footer>
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: palette.sky, alignItems: "center", justifyContent: "center" }}>
            <Image source={ART} style={{ width: 46, height: 46 }} contentFit="contain" accessible={false} />
          </View>
          <Body muted style={{ flex: 1 }}>Name the occasion and the area. You’ll share the link next.</Body>
        </View>
        <Field label="What’s the occasion?" icon="fork.knife" placeholder="Friday dinner" maxLength={120} onChangeText={setTitle} />
        {location ? (
          <View style={{ gap: space.sm }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: palette.text }}>Where should we look?</Text>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm + space.xs }}>
                <Icon name="checkmark.circle.fill" fallback="✓" size={22} color={palette.success} />
                <Text style={{ flex: 1, fontSize: 17, fontWeight: "600", color: palette.text }}>{location.label}</Text>
                <Button kind="quiet" size="small" label="Change" onPress={() => setLocation(null)} />
              </View>
              {location.data_provider === "google_maps" ? (
                <Image source={GOOGLE_MAPS} style={{ width: 82, height: 15 }} contentFit="contain" accessibilityLabel="Google Maps" />
              ) : null}
            </Card>
          </View>
        ) : (
          <Field
            label="Where should we look?"
            icon="mappin.and.ellipse"
            placeholder="Neighborhood, city or ZIP code"
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => query.trim().length >= 2 && find.mutate()}
          />
        )}
        <Footnote>Picks come from real restaurants near this area.</Footnote>
      </Screen>
    </KeyboardAvoidingView>
  );
}
