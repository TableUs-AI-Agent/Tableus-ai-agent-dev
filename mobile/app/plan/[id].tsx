import type { Plan } from "@tableus/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import type { SFSymbol } from "expo-symbols";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Alert, Platform, RefreshControl, ScrollView, Share, Text, View } from "react-native";

import { openInMaps, PickCard } from "@/components/pick-card";
import { Pip } from "@/components/pip";
import { TableScene } from "@/components/table-scene";
import { Avatar, Body, Button, Card, Centered, ErrorText, Field, Footnote, Heading, Icon, Pill, PressScale, Title } from "@/components/ui";
import { hasWishes, readWishes } from "@/components/wishes-form";
import { api, errorMessage } from "@/lib/api";
import { joinUrl } from "@/lib/links";
import { enableNotifications } from "@/lib/notifications";
import { useKeys, useMe, useSession } from "@/lib/session";
import { radius, space, usePalette } from "@/theme";

function usePlan(id: string) {
  const keys = useKeys();
  const queryClient = useQueryClient();
  const plan = useQuery({ queryKey: keys.plan(id), queryFn: () => api.getPlan(id) });
  const seen = useRef<string | null>(null);
  useEffect(() => {
    if (plan.data) seen.current = plan.data.updated_at;
  }, [plan.data]);

  // While this screen is visible, poll a cheap stamp and refetch when someone else changes the plan.
  useFocusEffect(useCallback(() => {
    const timer = setInterval(async () => {
      try {
        const { updated_at } = await api.planRevision(id);
        if (seen.current && updated_at !== seen.current) queryClient.invalidateQueries({ queryKey: keys.plan(id) });
      } catch {
        // Try again on the next tick.
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [id, queryClient, keys]));
  return plan;
}

/** Adds a pick to the end of the ranking, or takes it out if it's already there. */
function toggleRanking(ranking: string[], candidateId: string): string[] {
  if (ranking.includes(candidateId)) return ranking.filter((value) => value !== candidateId);
  return ranking.length < 3 ? [...ranking, candidateId] : ranking;
}

/**
 * The viewer's unsaved top three, shared by the table and the list. It starts
 * from their saved vote and starts over whenever the picks or plan status change.
 */
function useRanking(plan: Plan | undefined) {
  const key = plan ? `${plan.status}:${plan.candidates.map((item) => item.id).join()}` : "";
  const saved = plan?.my_vote ?? [];
  const [draft, setDraft] = useState<{ key: string; ranking: string[] } | null>(null);
  const ranking = draft?.key === key ? draft.ranking : saved;
  // Taps on the table can arrive faster than renders, so toggle from the latest draft.
  const toggle = (candidateId: string) => setDraft((current) => ({
    key,
    ranking: toggleRanking(current?.key === key ? current.ranking : saved, candidateId),
  }));
  return [ranking, toggle] as const;
}

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = usePalette();
  const plan = usePlan(id);
  const [ranking, toggle] = useRanking(plan.data);
  const { session } = useSession();
  const open = plan.data ? plan.data.status !== "finalized" : false;
  // Ask for notifications in a plan that's still going, where "picks are ready" means something.
  useEffect(() => {
    if (open && session.status === "signed-in") enableNotifications(session.subject, true);
  }, [open, session]);

  if (plan.isPending) return <Centered><ActivityIndicator color={palette.text} /></Centered>;
  if (plan.isError) {
    return (
      <Centered>
        <Pip pose="sleepy" size={120} />
        <Title size={32}>Couldn’t open this plan</Title>
        <ErrorText>{errorMessage(plan.error)}</ErrorText>
        <Button kind="secondary" icon="arrow.clockwise" label="Try again" onPress={() => plan.refetch()} />
      </Centered>
    );
  }
  const data = plan.data;
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
              {data.status !== "finalized" ? (
                <PressScale accessibilityLabel="Share invite link" onPress={() => shareInvite(data)} haptic={false}>
                  <Icon name="square.and.arrow.up" fallback="↗" size={20} />
                </PressScale>
              ) : null}
              {data.viewer_is_organizer ? <OrganizerMenu plan={data} /> : null}
            </View>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={{ padding: space.md, gap: space.lg, paddingBottom: space.xxl * 2 }}
        refreshControl={<RefreshControl refreshing={plan.isRefetching} onRefresh={() => plan.refetch()} />}
      >
        <View style={{ gap: space.sm }}>
          <Title size={40}>{data.title}</Title>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Icon name="mappin.and.ellipse" fallback="" size={14} color={palette.secondary} />
            <Text style={{ fontSize: 16, color: palette.secondary }}>{data.location_label}</Text>
          </View>
        </View>
        <Progress status={data.status} />
        <TableScene
          plan={data}
          ranking={ranking}
          onPick={data.status === "voting" ? (candidateId) => {
            Haptics.selectionAsync();
            toggle(candidateId);
          } : undefined}
        />
        <People plan={data} />
        {data.participants.length < 2 && data.status !== "finalized" ? <InviteCard plan={data} /> : null}
        {data.status === "collecting" ? <Collecting plan={data} /> : null}
        {data.status === "voting" ? <Voting plan={data} ranking={ranking} onToggle={toggle} /> : null}
        {data.status === "finalized" ? <Decided plan={data} /> : null}
      </ScrollView>
    </>
  );
}

const STEPS: { status: Plan["status"] | "picks"; label: string; icon: SFSymbol }[] = [
  { status: "collecting", label: "Wishes", icon: "text.bubble.fill" },
  { status: "voting", label: "Vote", icon: "hand.raised.fill" },
  { status: "finalized", label: "Decided", icon: "checkmark.seal.fill" },
];

/** Where the plan is, like an order tracker: done steps filled, the current one in radicchio. */
function Progress({ status }: { status: Plan["status"] }) {
  const palette = usePalette();
  const current = STEPS.findIndex((step) => step.status === status);
  return (
    <View
      accessibilityLabel={`Step ${current + 1} of ${STEPS.length}: ${STEPS[current].label}`}
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      {STEPS.map((step, index) => {
        const done = index < current || status === "finalized";
        const active = index === current;
        const fill = active && status !== "finalized" ? palette.accent : done ? palette.success : palette.fill;
        const ink = active || done ? "#FFFFFF" : palette.tertiary;
        return (
          <View key={step.label} style={{ flexDirection: "row", alignItems: "center", flex: index ? 1 : 0 }}>
            {index ? <View style={{ flex: 1, height: 2, marginHorizontal: 6, borderRadius: 1, backgroundColor: index <= current ? palette.success : palette.fill }} /> : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: fill, borderRadius: radius.pill, paddingLeft: 6, paddingRight: 10, paddingVertical: 5 }}>
              <Icon name={done && !active ? "checkmark" : step.icon} fallback="" size={12} color={ink} weight="bold" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: ink }}>{step.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function useUpdate(id: string) {
  const keys = useKeys();
  const queryClient = useQueryClient();
  return (next: Plan) => {
    queryClient.setQueryData(keys.plan(id), next);
    queryClient.invalidateQueries({ queryKey: keys.plans });
  };
}

function shareInvite(plan: Plan) {
  const url = joinUrl(plan.id, plan.share_token);
  const message = `Help pick where we eat for ${plan.title}`;
  // iOS sends the url alongside the message, so putting it in both shows it twice.
  Share.share(Platform.OS === "ios" ? { message, url } : { message: `${message}: ${url}` });
}

/** Rare organizer actions live behind one menu, out of the group's way. */
function OrganizerMenu({ plan }: { plan: Plan }) {
  const keys = useKeys();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rotate = useMutation({
    mutationFn: () => api.newShareLink(plan.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.plan(plan.id) }),
    onError: (failure) => Alert.alert("Couldn’t make a new link", errorMessage(failure)),
  });
  const remove = useMutation({
    mutationFn: () => api.deletePlan(plan.id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: keys.plan(plan.id) });
      queryClient.invalidateQueries({ queryKey: keys.plans });
      router.back();
    },
    onError: (failure) => Alert.alert("Couldn’t delete the plan", errorMessage(failure)),
  });

  const confirmRotate = () => Alert.alert("Make a new link?", "The old link stops working for anyone who hasn't joined yet.", [
    { text: "Cancel", style: "cancel" },
    { text: "Make new link", onPress: () => rotate.mutate() },
  ]);
  const confirmDelete = () => Alert.alert(`Delete “${plan.title}”?`, "This deletes the plan for everyone in it.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => remove.mutate() },
  ]);

  function open() {
    const actions = [
      ...(plan.status !== "finalized" ? [{ label: "Make a new invite link", run: confirmRotate }] : []),
      { label: "Delete plan", run: confirmDelete, destructive: true },
    ];
    if (process.env.EXPO_OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...actions.map((action) => action.label), "Cancel"], cancelButtonIndex: actions.length, destructiveButtonIndex: actions.length - 1 },
        (index) => actions[index]?.run(),
      );
    } else {
      Alert.alert("Plan options", undefined, [
        ...actions.map((action) => ({ text: action.label, onPress: action.run, style: action.destructive ? ("destructive" as const) : ("default" as const) })),
        { text: "Cancel", style: "cancel" as const },
      ]);
    }
  }

  return (
    <PressScale accessibilityLabel="Plan options" onPress={open} haptic={false} disabled={rotate.isPending || remove.isPending}>
      {rotate.isPending || remove.isPending ? <ActivityIndicator /> : <Icon name="ellipsis.circle" fallback="…" size={22} />}
    </PressScale>
  );
}

function People({ plan }: { plan: Plan }) {
  const palette = usePalette();
  const voting = plan.status === "voting";
  const done = (person: Plan["participants"][number]) => (voting ? person.has_voted : hasWishes(person.constraints));
  const count = plan.participants.filter(done).length;
  const summary = plan.status === "finalized"
    ? `${plan.participants.length} at the table`
    : `${count} of ${plan.participants.length} ${voting ? "voted" : "added wishes"}`;
  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Heading>Who’s coming</Heading>
        <Text style={{ fontSize: 14, fontWeight: "600", color: palette.secondary, fontVariant: ["tabular-nums"] }}>{summary}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
        {plan.participants.map((person) => {
          const finished = plan.status !== "finalized" && done(person);
          return (
            <View key={person.profile_id} style={{ alignItems: "center", gap: 6, width: 64 }}>
              <Avatar name={person.display_name} size={48} badge={finished ? "done" : person.is_organizer ? "organizer" : undefined} />
              <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "600", color: palette.text }}>{person.display_name}</Text>
            </View>
          );
        })}
      </View>
      {plan.participants.some((person) => person.is_organizer) ? (
        <View style={{ flexDirection: "row", gap: space.md }}>
          <Legend icon="star.fill" color={palette.butter} label="Organizer" />
          {plan.status !== "finalized" ? <Legend icon="checkmark" color={palette.success} label={voting ? "Voted" : "Added wishes"} /> : null}
        </View>
      ) : null}
    </Card>
  );
}

function Legend({ icon, color, label }: { icon: SFSymbol; color: string; label: string }) {
  const palette = usePalette();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} fallback="" size={7} color={color === palette.butter ? palette.onButter : "#FFFFFF"} weight="black" />
      </View>
      <Footnote>{label}</Footnote>
    </View>
  );
}

function InviteCard({ plan }: { plan: Plan }) {
  const palette = usePalette();
  return (
    <Card tone="dark">
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View style={{ flex: 1, gap: space.xs }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: palette.onInk }}>Bring the group in</Text>
          <Text style={{ fontSize: 15, lineHeight: 21, color: palette.onInk, opacity: 0.85 }}>Anyone with the link can join, up to eight people. They can use the web, no app needed.</Text>
        </View>
        <Pip pose="invite" size={76} />
      </View>
      <Button label="Share invite link" icon="square.and.arrow.up" onPress={() => shareInvite(plan)} />
    </Card>
  );
}

function MyWishes({ plan }: { plan: Plan }) {
  const palette = usePalette();
  const router = useRouter();
  const me = useMe();
  const mine = plan.participants.find((person) => person.profile_id === me.data?.id);
  const wishes = readWishes(mine?.constraints);
  const tags = [
    ...(wishes.cuisines ?? []),
    ...(wishes.dietary_notes ?? []),
    ...(wishes.max_price_level ? [`Up to ${"$".repeat(wishes.max_price_level)}`] : []),
  ];
  const empty = !hasWishes(mine?.constraints);
  return (
    <PressScale onPress={() => router.push(`/wishes/${plan.id}`)} accessibilityLabel={empty ? "Add your wishes" : "Edit your wishes"} haptic={false}>
      <Card style={empty ? { borderWidth: 2, borderColor: palette.accent, borderStyle: "dashed" } : undefined}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
          <Icon name="text.bubble.fill" fallback="" size={18} color={palette.accent} />
          <View style={{ flex: 1 }}><Heading>Your wishes</Heading></View>
          <Text style={{ fontSize: 15, fontWeight: "600", color: palette.accent }}>{empty ? "Add" : "Edit"}</Text>
          <Icon name="chevron.right" fallback="›" size={13} color={palette.accent} weight="semibold" />
        </View>
        {empty ? (
          <Body muted>Say what you’re in the mood for, what you can’t eat and what you want to spend. Everyone in the plan sees it.</Body>
        ) : (
          <>
            {wishes.notes?.trim() ? <Body>“{wishes.notes.trim()}”</Body> : null}
            {tags.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {tags.map((tag) => <Pill key={tag} label={tag} />)}
              </View>
            ) : null}
          </>
        )}
      </Card>
    </PressScale>
  );
}

function Collecting({ plan }: { plan: Plan }) {
  const palette = usePalette();
  const update = useUpdate(plan.id);
  const [request, setRequest] = useState("");
  const suggest = useMutation({
    mutationKey: ["suggest", plan.id],
    mutationFn: () => api.suggest(plan.id, request.trim()),
    onSuccess: (next) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      update(next);
    },
  });
  const enough = plan.participants.length >= 2;
  return (
    <>
      <MyWishes plan={plan} />
      <Card tone="tinted">
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <View style={{ flex: 1, gap: space.xs }}>
            <Heading>{suggest.isPending ? "Pip is on it" : "Ready when everyone is"}</Heading>
            <Text style={{ fontSize: 15, lineHeight: 21, color: palette.secondary }}>
              {suggest.isPending
                ? "Reading everyone’s wishes and checking real places nearby."
                : enough
                  ? "Anyone can ask for picks once the group has added their wishes."
                  : "Invite at least one more person, then get picks together."}
            </Text>
          </View>
          <Pip pose="think" size={72} float={suggest.isPending} />
        </View>
        {enough ? (
          <>
            <Field label="Anything else? (optional)" icon="plus.bubble" placeholder="Close to the theater, good for a birthday" maxLength={500} onChangeText={setRequest} />
            {suggest.isError ? <ErrorText>{errorMessage(suggest.error)}</ErrorText> : null}
            <Button label={suggest.isPending ? "Finding places for everyone" : "Get four picks"} icon="fork.knife" busy={suggest.isPending} onPress={() => suggest.mutate()} />
          </>
        ) : null}
      </Card>
    </>
  );
}

function Voting({ plan, ranking, onToggle }: { plan: Plan; ranking: string[]; onToggle: (candidateId: string) => void }) {
  const palette = usePalette();
  const router = useRouter();
  const update = useUpdate(plan.id);
  const vote = useMutation({
    mutationFn: (next: string[]) => api.vote(plan.id, next),
    onSuccess: (next) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      update(next);
    },
  });
  const finalize = useMutation({
    mutationFn: () => api.finalize(plan.id),
    onSuccess: (next) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      update(next);
    },
  });
  const rankingKey = JSON.stringify(ranking);
  const saved = ranking.length === 3 && rankingKey === JSON.stringify(plan.my_vote ?? []);
  // A full top three saves itself, so taps on the table count without a second step.
  // A failed save waits for a retry or a new tap instead of looping.
  const failedThis = vote.isError && JSON.stringify(vote.variables) === rankingKey;
  const saveNow = ranking.length === 3 && !saved && !vote.isPending && !failedThis;
  const { mutate } = vote;
  useEffect(() => {
    if (saveNow) mutate(JSON.parse(rankingKey) as string[]);
  }, [saveNow, rankingKey, mutate]);
  const voters = plan.participants.filter((person) => person.has_voted).length;
  const leader = [...plan.candidates].sort((a, b) => b.vote_score - a.vote_score || a.rank - b.rank)[0];
  const status = ranking.length < 3
    ? `Tap ${3 - ranking.length} more`
    : saved ? "Vote saved" : vote.isPending ? "Saving…" : "";

  return (
    <>
      <View style={{ gap: space.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm }}>
          <Heading>Rank your top three</Heading>
          <View style={{ flexDirection: "row", gap: 5 }} accessibilityLabel={`${ranking.length} of 3 picked`}>
            {[0, 1, 2].map((slot) => (
              <View key={slot} style={{
                width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center",
                backgroundColor: slot < ranking.length ? palette.butter : "transparent",
                borderWidth: slot < ranking.length ? 0 : 1.5, borderColor: palette.border, borderStyle: "dashed",
              }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: slot < ranking.length ? palette.onButter : palette.tertiary }}>{slot + 1}</Text>
              </View>
            ))}
          </View>
        </View>
        <Body muted>Tap in order of preference, here or on the table. Tap again to undo.</Body>
      </View>
      <View style={{ gap: space.md }}>
        {plan.candidates.map((candidate) => {
          const position = ranking.indexOf(candidate.id);
          return <PickCard key={candidate.id} candidate={candidate} rank={position >= 0 ? position : undefined} onToggle={() => onToggle(candidate.id)} />;
        })}
      </View>
      {vote.isError ? <ErrorText>{errorMessage(vote.error)}</ErrorText> : null}
      {failedThis ? (
        <Button label="Try saving again" icon="arrow.clockwise" onPress={() => vote.mutate(ranking)} />
      ) : status ? (
        <View style={{ flexDirection: "row", alignSelf: "center", alignItems: "center", gap: 6 }}>
          {saved ? <Icon name="checkmark.circle.fill" fallback="✓" size={18} color={palette.success} /> : null}
          <Text style={{ fontSize: 16, fontWeight: "600", color: saved ? palette.success : palette.secondary }}>{status}</Text>
        </View>
      ) : null}
      {plan.viewer_is_organizer && leader ? (
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
            <Icon name="lock.fill" fallback="" size={16} color={palette.accent} />
            <Heading>Lock it in</Heading>
          </View>
          <View style={{ gap: 6 }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: palette.fill, overflow: "hidden" }}>
              <View style={{ width: `${(voters / Math.max(plan.participants.length, 1)) * 100}%`, height: 8, borderRadius: 4, backgroundColor: palette.success }} />
            </View>
            <Footnote>{voters} of {plan.participants.length} voted{voters ? `. ${leader.place.name} is in the lead.` : ". Wait for votes, or decide now."}</Footnote>
          </View>
          {finalize.isError ? <ErrorText>{errorMessage(finalize.error)}</ErrorText> : null}
          <Button kind="secondary" icon="checkmark.seal.fill" label={`Go with ${leader.place.name}`} busy={finalize.isPending} onPress={() => finalize.mutate()} />
        </Card>
      ) : null}
      <Button kind="quiet" icon="arrow.uturn.backward" label="None of these work? Change your wishes" onPress={() => router.push(`/wishes/${plan.id}`)} />
    </>
  );
}

function Decided({ plan }: { plan: Plan }) {
  const update = useUpdate(plan.id);
  const reopen = useMutation({ mutationFn: () => api.reopen(plan.id), onSuccess: update });
  const winner = plan.candidates.find((candidate) => candidate.id === plan.finalized_candidate_id);
  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View style={{ flex: 1, gap: space.xs }}>
          <Pill icon="checkmark.seal.fill" label="Decided" tone="success" />
          <Title size={36}>You’re going to</Title>
        </View>
        <Pip pose="cheer" size={92} />
      </View>
      {winner ? (
        <>
          <PickCard candidate={winner} winner />
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <View style={{ flex: 1 }}><Button label="Directions" icon="map.fill" onPress={() => openInMaps(winner.place)} /></View>
            <View style={{ flex: 1 }}>
              <Button
                kind="secondary"
                icon="square.and.arrow.up"
                label="Share"
                onPress={() => Share.share({ message: `${plan.title}: we’re going to ${winner.place.name}, ${winner.place.address}` })}
              />
            </View>
          </View>
        </>
      ) : <Body>The chosen place couldn’t be loaded.</Body>}
      {plan.viewer_is_organizer ? (
        <>
          {reopen.isError ? <ErrorText>{errorMessage(reopen.error)}</ErrorText> : null}
          <Button kind="quiet" icon="arrow.counterclockwise" label="Reopen voting" busy={reopen.isPending} onPress={() => reopen.mutate()} />
        </>
      ) : null}
    </View>
  );
}
