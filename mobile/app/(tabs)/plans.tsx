import type { Plan } from "@tableus/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/theme";

export default function PlansScreen() {
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => api.get<Plan[]>("/api/v1/plans") });
  const create = useMutation({
    mutationFn: () => api.post<{ plan: Plan; share_token: string }>("/api/v1/plans", { title, location_label: "Boston, MA", latitude: 42.3601, longitude: -71.0589 }),
    onSuccess: () => { setTitle(""); client.invalidateQueries({ queryKey: ["plans"] }); },
  });

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} refreshControl={<RefreshControl refreshing={plans.isRefetching} onRefresh={plans.refetch} />}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: "800" }}>Start a dinner decision</Text>
        <Field
          accessibilityLabel="Plan title"
          value={title}
          onChangeText={setTitle}
          placeholder="Friday dinner"
          returnKeyType="done"
        />
        {create.error ? <ErrorText message={create.error.message} /> : null}
        <Button label="Create shared plan" onPress={() => create.mutate()} disabled={!title.trim()} loading={create.isPending} />
      </Card>
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
