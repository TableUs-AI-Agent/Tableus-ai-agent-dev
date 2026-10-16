import type { PlanSummary } from "@tableus/api-client";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { Avatar, Body, Button, Card, ErrorText, Icon, PressScale } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { pendingJoin } from "@/lib/links";
import { useKeys, useMe } from "@/lib/session";
import { space, usePalette } from "@/theme";

const STATUS: Record<PlanSummary["status"], string> = {
  collecting: "Collecting wishes",
  voting: "Voting",
  finalized: "Decided",
};

export default function Plans() {
  const keys = useKeys();
  const palette = usePalette();
  const router = useRouter();
  const me = useMe();
  const plans = useQuery({ queryKey: keys.plans, queryFn: api.listPlans });
  const canCreate = me.data?.can_create_plans ?? false;

  // A join link opened before sign-in resumes here once the person is set up.
  useEffect(() => {
    const waiting = pendingJoin.peek();
    if (waiting) router.push(`/join/${waiting.planId}`);
  }, [router]);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <PressScale accessibilityLabel="Account" haptic={false} onPress={() => router.push("/account")}>
              <Avatar name={me.data?.display_name ?? "?"} />
            </PressScale>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={{ padding: space.md, gap: space.lg, paddingBottom: space.xxl * 2 }}
        refreshControl={<RefreshControl refreshing={plans.isRefetching} onRefresh={() => plans.refetch()} />}
      >
        {canCreate ? (
          <Button label="Start a plan" onPress={() => router.push("/new-plan")} />
        ) : (
          <Card><Body>Starting plans is invite-only for now. When a friend sends you a plan link, open it to join.</Body></Card>
        )}

        {plans.isError ? (
          <View style={{ gap: space.sm }}>
            <ErrorText>{errorMessage(plans.error)}</ErrorText>
            <Button kind="quiet" label="Try again" onPress={() => plans.refetch()} />
          </View>
        ) : plans.data?.length === 0 ? (
          <Body muted>Nothing here yet. Plans you start or join show up here.</Body>
        ) : (
          <View style={{ borderTopWidth: 2, borderColor: palette.border }}>
            {(plans.data ?? []).map((plan) => (
              <PressScale key={plan.id} onPress={() => router.push(`/plan/${plan.id}`)} haptic={false} accessibilityLabel={`${plan.title}, ${STATUS[plan.status]}`} style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md, borderBottomWidth: 2, borderColor: palette.border }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: palette.text }}>{plan.title}</Text>
                    <Text style={{ fontSize: 15, color: palette.secondary }} numberOfLines={1}>{plan.location_label}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: plan.status === "finalized" ? palette.text : palette.accent }}>{STATUS[plan.status]}</Text>
                    <Text style={{ fontSize: 14, color: palette.secondary, fontVariant: ["tabular-nums"] }}>{plan.participant_count} {plan.participant_count === 1 ? "person" : "people"}</Text>
                  </View>
                  <Icon name="chevron.right" fallback="›" size={14} color={palette.secondary} />
              </PressScale>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}
