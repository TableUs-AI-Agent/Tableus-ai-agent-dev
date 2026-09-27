import type { Plan, PlanSummary, ResolvedLocation } from "@tableus/domain";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { MutationFeedback } from "@/components/mutation-feedback";
import { GoogleMapsAttribution } from "@/components/google-maps-attribution";
import { api } from "@/lib/api";
import { OFFLINE_REFRESH_MESSAGE, refreshWhenOnline } from "@/lib/offline-refresh";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";
import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

export default function PlansScreen() {
  const client = useQueryClient();
  const { isOnline } = useConnectivity();
  const [title, setTitle] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<ResolvedLocation | null>(null);
  const [refreshMessage, setRefreshMessage] = useState("");
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => api.get<PlanSummary[]>("/api/v1/plans") });
  const lookup = useRecoverableMutation({
    mutationFn: (body: { query: string }, idempotencyKey) =>
      api.post<ResolvedLocation>("/api/v1/locations/resolve", body, { idempotencyKey }),
    onSuccess: (location) => setSelectedLocation(location),
  });
  const create = useRecoverableMutation({
    mutationFn: (body: { title: string; location_label: string; location_place_id: string }, idempotencyKey) =>
      api.post<{ plan: Plan; share_token: string }>("/api/v1/plans", body, { idempotencyKey }),
    onSuccess: () => {
      setTitle("");
      setLocationInput("");
      setSelectedLocation(null);
      client.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  const refresh = async () => {
    const refreshed = await refreshWhenOnline(isOnline, plans.refetch);
    setRefreshMessage(refreshed ? "" : OFFLINE_REFRESH_MESSAGE);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} refreshControl={<RefreshControl refreshing={plans.isRefetching} onRefresh={() => void refresh()} />}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: "800" }}>Start a dinner decision</Text>
        <Field
          accessibilityLabel="Plan title"
          value={title}
          onChangeText={(value) => { create.reset(); setTitle(value); }}
          placeholder="Friday dinner"
          returnKeyType="done"
        />
        <Field
          accessibilityLabel="City, neighborhood, or ZIP code"
          value={locationInput}
          onChangeText={(value) => {
            lookup.reset();
            create.reset();
            setSelectedLocation(null);
            setLocationInput(value);
          }}
          placeholder="City, neighborhood, or ZIP code"
          returnKeyType="search"
        />
        <MutationFeedback failure={lookup.failure} canRetry={lookup.canRetry} retryLabel="Retry finding location" onRetry={lookup.retry} onDismiss={lookup.reset} />
        <Button
          label="Find location"
          onPress={() => lookup.submit({ query: locationInput.trim() })}
          disabled={!locationInput.trim() || lookup.canRetry}
          loading={lookup.isPending}
        />
        {selectedLocation ? <View accessibilityLiveRegion="polite" style={{ gap: 4, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 14 }}><Text selectable style={{ color: colors.ink, fontWeight: "700" }}>{selectedLocation.label}</Text><GoogleMapsAttribution /></View> : null}
        <MutationFeedback failure={create.failure} canRetry={create.canRetry} retryLabel="Retry creating plan" onRetry={create.retry} onDismiss={create.reset} />
        <Button
          label="Create shared plan"
          onPress={() => selectedLocation && create.submit({ title: title.trim(), location_label: locationInput.trim().replace(/\s+/g, " "), location_place_id: selectedLocation.place_id })}
          disabled={!title.trim() || !selectedLocation || create.canRetry}
          loading={create.isPending}
        />
      </Card>
      {refreshMessage ? <Text selectable accessibilityRole="alert" style={{ color: colors.muted }}>{refreshMessage}</Text> : null}
      {plans.error ? <ErrorText message={plans.error.message} /> : null}
      {(plans.data ?? []).map((plan) => (
        <Link key={plan.id} href={{ pathname: "/plans/[id]", params: { id: plan.id } }} asChild>
          <Pressable>
            <Card>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700", flex: 1 }}>{plan.title}</Text>
                <Text selectable style={{ color: colors.green, textTransform: "capitalize" }}>{plan.status}</Text>
              </View>
              <Text selectable style={{ color: colors.muted }}>{plan.location_label} · {plan.participant_count} people</Text>
            </Card>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
