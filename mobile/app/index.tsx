import type { PlanSummary } from "@tableus/api-client";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import type { SFSymbol } from "expo-symbols";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Pip } from "@/components/pip";
import { Avatar, Body, Button, Card, ErrorText, Icon, Pill, PressScale, Title } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { since } from "@/lib/format";
import { pendingJoin } from "@/lib/links";
import { useKeys, useMe } from "@/lib/session";
import { elevation, radius, space, usePalette } from "@/theme";

const STATUS: Record<PlanSummary["status"], { label: string; icon: SFSymbol; tone: "accent" | "butter" | "success"; art: number }> = {
  collecting: { label: "Collecting wishes", icon: "text.bubble.fill", tone: "accent", art: require("../assets/art/spot-wishes.webp") },
  voting: { label: "Voting", icon: "hand.raised.fill", tone: "butter", art: require("../assets/art/spot-vote.webp") },
  finalized: { label: "Decided", icon: "checkmark.seal.fill", tone: "success", art: require("../assets/art/spot-lock.webp") },
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

  const list = plans.data ?? [];
  const open = list.filter((plan) => plan.status !== "finalized");
  const decided = list.filter((plan) => plan.status === "finalized");

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
              {canCreate && list.length ? (
                <PressScale accessibilityLabel="Start a plan" haptic={false} onPress={() => router.push("/new-plan")}>
                  <Icon name="plus.circle.fill" fallback="+" size={28} color={palette.accent} />
                </PressScale>
              ) : null}
              <PressScale accessibilityLabel="Account" haptic={false} onPress={() => router.push("/account")}>
                <Avatar name={me.data?.display_name ?? "?"} size={32} />
              </PressScale>
            </View>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={{ padding: space.md, gap: space.lg, paddingBottom: space.xxl * 2 }}
        refreshControl={<RefreshControl refreshing={plans.isRefetching} onRefresh={() => plans.refetch()} />}
      >
        <Title size={48}>Plans</Title>
        {plans.isPending ? (
          <View style={{ gap: space.sm + space.xs }}>{[0, 1, 2].map((index) => <SkeletonRow key={index} />)}</View>
        ) : plans.isError ? (
          <Card>
            <ErrorText>{errorMessage(plans.error)}</ErrorText>
            <Button kind="secondary" icon="arrow.clockwise" label="Try again" onPress={() => plans.refetch()} />
          </Card>
        ) : list.length === 0 ? (
          <Empty canCreate={canCreate} onStart={() => router.push("/new-plan")} />
        ) : (
          <>
            {open.length ? <Section title="In progress" plans={open} /> : null}
            {decided.length ? <Section title="Decided" plans={decided} /> : null}
          </>
        )}
      </ScrollView>
    </>
  );
}

function Section({ title, plans }: { title: string; plans: PlanSummary[] }) {
  const palette = usePalette();
  return (
    <View style={{ gap: space.sm + space.xs }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: "700", color: palette.text }}>{title}</Text>
      {plans.map((plan) => <PlanRow key={plan.id} plan={plan} />)}
    </View>
  );
}

function PlanRow({ plan }: { plan: PlanSummary }) {
  const palette = usePalette();
  const router = useRouter();
  const status = STATUS[plan.status];
  const people = `${plan.participant_count} ${plan.participant_count === 1 ? "person" : "people"}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${plan.title}, ${status.label}, ${people}, ${plan.location_label}`}
      onPress={() => router.push(`/plan/${plan.id}`)}
    >
      {({ pressed }) => (
        <View style={{
          flexDirection: "row", gap: space.md, alignItems: "center", padding: space.sm + space.xs,
          borderRadius: radius.card, borderCurve: "continuous", boxShadow: elevation.card,
          backgroundColor: pressed ? palette.fill : palette.surface,
        }}>
          <View style={{ width: 72, height: 72, borderRadius: 16, borderCurve: "continuous", backgroundColor: palette.sky, alignItems: "center", justifyContent: "center" }}>
            <Image source={status.art} style={{ width: 54, height: 54 }} contentFit="contain" accessible={false} />
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "700", color: palette.text }}>{plan.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Icon name="mappin.and.ellipse" fallback="" size={12} color={palette.secondary} />
              <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, color: palette.secondary }}>{plan.location_label}</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: space.sm }}>
              <Pill icon={status.icon} label={status.label} tone={status.tone} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Icon name="person.2.fill" fallback="" size={12} color={palette.tertiary} />
                <Text style={{ fontSize: 13, color: palette.tertiary, fontVariant: ["tabular-nums"] }}>{plan.participant_count}</Text>
              </View>
              <Text style={{ fontSize: 13, color: palette.tertiary }}>{since(plan.updated_at)}</Text>
            </View>
          </View>
          <Icon name="chevron.right" fallback="›" size={13} color={palette.tertiary} weight="semibold" />
        </View>
      )}
    </Pressable>
  );
}

function SkeletonRow() {
  const palette = usePalette();
  return (
    <View style={{ flexDirection: "row", gap: space.md, alignItems: "center", padding: space.sm + space.xs, borderRadius: radius.card, backgroundColor: palette.surface }}>
      <View style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: palette.fill }} />
      <View style={{ flex: 1, gap: space.sm }}>
        <View style={{ width: "60%", height: 16, borderRadius: 8, backgroundColor: palette.fill }} />
        <View style={{ width: "80%", height: 12, borderRadius: 6, backgroundColor: palette.fill }} />
        <View style={{ width: "40%", height: 20, borderRadius: 10, backgroundColor: palette.fill }} />
      </View>
    </View>
  );
}

function Empty({ canCreate, onStart }: { canCreate: boolean; onStart: () => void }) {
  const palette = usePalette();
  return (
    <View style={{ alignItems: "center", gap: space.md, paddingTop: space.xl }}>
      <View style={{ width: 168, height: 168, borderRadius: 84, backgroundColor: palette.sky, alignItems: "center", justifyContent: "center" }}>
        <Pip pose="empty" size={132} />
      </View>
      <Title size={36}>No plans yet</Title>
      <Body muted style={{ textAlign: "center", maxWidth: 300 }}>
        {canCreate
          ? "Start one, share the link, and Pip finds places that work for everyone."
          : "Starting plans is invite-only for now. Open a plan link from a friend to join."}
      </Body>
      {canCreate ? <Button label="Start a plan" icon="plus" onPress={onStart} /> : null}
    </View>
  );
}
