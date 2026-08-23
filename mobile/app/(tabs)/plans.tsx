import type { Plan } from "@tableus/domain";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { MutationFeedback } from "@/components/mutation-feedback";
import { api } from "@/lib/api";
import { OFFLINE_REFRESH_MESSAGE, refreshWhenOnline } from "@/lib/offline-refresh";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";
import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

export default function PlansScreen() {
  const client = useQueryClient();
  const { isOnline } = useConnectivity();
  const [title, setTitle] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => api.get<Plan[]>("/api/v1/plans") });
  const create = useRecoverableMutation({
    mutationFn: (body: { title: string; location_label: string; latitude: number; longitude: number }, idempotencyKey) =>
      api.post<{ plan: Plan; share_token: string }>("/api/v1/plans", body, { idempotencyKey }),
    onSuccess: () => { setTitle(""); client.invalidateQueries({ queryKey: ["plans"] }); },
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
        <MutationFeedback failure={create.failure} canRetry={create.canRetry} retryLabel="Retry creating plan" onRetry={create.retry} onDismiss={create.reset} />
        <Button
          label="Create shared plan"
          onPress={() => create.submit({ title, location_label: "Boston, MA", latitude: 42.3601, longitude: -71.0589 })}
          disabled={!title.trim() || create.canRetry}
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
              <Text selectable style={{ color: colors.muted }}>{plan.location_label} · {plan.participants.length} people</Text>
            </Card>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
