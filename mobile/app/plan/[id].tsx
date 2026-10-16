import type { Plan } from "@tableus/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Share, Text, View } from "react-native";

import { PickCard } from "@/components/pick-card";
import { TableScene } from "@/components/table-scene";
import { Avatar, Body, Button, Card, Centered, ErrorText, Field, Heading, Icon, PressScale, Title } from "@/components/ui";
import { hasWishes } from "@/components/wishes-form";
import { useKeys } from "@/lib/session";
import { api, errorMessage } from "@/lib/api";
import { joinUrl } from "@/lib/links";
import { space, usePalette } from "@/theme";

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

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = usePalette();
  const plan = usePlan(id);

  if (plan.isPending) return <Centered><ActivityIndicator color={palette.text} /></Centered>;
  if (plan.isError) {
    return (
      <Centered>
        <ErrorText>{errorMessage(plan.error)}</ErrorText>
        <Button kind="quiet" label="Try again" onPress={() => plan.refetch()} />
      </Centered>
    );
  }
  const data = plan.data;
  return (
    <>
      <Stack.Screen options={{ headerRight: () => (data.status !== "finalized" ? <ShareButton plan={data} /> : null) }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={{ padding: space.md, gap: space.lg, paddingBottom: space.xxl * 2 }}
        refreshControl={<RefreshControl refreshing={plan.isRefetching} onRefresh={() => plan.refetch()} />}
      >
        <View style={{ gap: space.xs }}>
          <Title>{data.title}</Title>
          <Body muted>{data.location_label}</Body>
        </View>
        <TableScene plan={data} />
        <People plan={data} />
        {data.participants.length < 2 ? <InviteCard plan={data} /> : null}
        {data.status === "collecting" ? <Collecting plan={data} /> : null}
        {data.status === "voting" ? <Voting key={data.candidates.map((item) => item.id).join()} plan={data} /> : null}
        {data.status === "finalized" ? <Decided plan={data} /> : null}
        {data.viewer_is_organizer ? <OrganizerTools plan={data} /> : null}
      </ScrollView>
    </>
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
  Share.share({ message: `Help pick where we eat for ${plan.title}: ${url}`, url });
}

function ShareButton({ plan }: { plan: Plan }) {
  return (
    <PressScale accessibilityLabel="Share invite link" onPress={() => shareInvite(plan)} haptic={false}>
      <Icon name="square.and.arrow.up" fallback="↗" />
    </PressScale>
  );
}

function People({ plan }: { plan: Plan }) {
  const palette = usePalette();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
      {plan.participants.map((person) => {
        const done = plan.status === "voting" ? person.has_voted : hasWishes(person.constraints);
        const note = plan.status === "voting" ? (person.has_voted ? "voted" : "still voting")
          : plan.status === "collecting" ? (done ? "added wishes" : "no wishes yet") : "";
        return (
          <View key={person.profile_id} style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
            <Avatar name={person.display_name} highlight={done} />
            <View>
              <Text style={{ fontWeight: "600", color: palette.text }}>{person.display_name}{person.is_organizer ? " (organizer)" : ""}</Text>
              {note ? <Text style={{ fontSize: 13, color: palette.secondary }}>{note}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function InviteCard({ plan }: { plan: Plan }) {
  const palette = usePalette();
  return (
    <Card emphasis="dark">
      <Text style={{ fontSize: 20, fontWeight: "700", color: palette.background }}>Send this link to the group</Text>
      <Text style={{ fontSize: 16, color: palette.background }}>Anyone with the link can join, up to eight people.</Text>
      <Button label="Share invite link" onPress={() => shareInvite(plan)} />
    </Card>
  );
}

function Collecting({ plan }: { plan: Plan }) {
  const router = useRouter();
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
      <View style={{ gap: space.sm }}>
        <Heading>What do you want?</Heading>
        <Body muted>Everyone in the plan sees your wishes. Your standing tastes from your account are included too.</Body>
        <Button kind="quiet" label="Add or edit my wishes" onPress={() => router.push(`/wishes/${plan.id}`)} />
      </View>
      <Card emphasis="outlined">
        <Heading>Ready when everyone is</Heading>
        {enough ? (
          <>
            <Body>Anyone can ask for picks once the group has added their wishes.</Body>
            <Field label="Anything else? (optional)" placeholder="Close to the theater, good for a birthday" maxLength={500} onChangeText={setRequest} />
            {suggest.isError ? <ErrorText>{errorMessage(suggest.error)}</ErrorText> : null}
            <Button label={suggest.isPending ? "Finding places for everyone" : "Get four picks"} busy={suggest.isPending} onPress={() => suggest.mutate()} />
          </>
        ) : (
          <Body>Invite at least one more person, then get picks together.</Body>
        )}
      </Card>
    </>
  );
}

function Voting({ plan }: { plan: Plan }) {
  const router = useRouter();
  const update = useUpdate(plan.id);
  const [ranking, setRanking] = useState<string[]>(plan.my_vote ?? []);
  const vote = useMutation({
    mutationFn: () => api.vote(plan.id, ranking),
    onSuccess: (next) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      update(next);
    },
  });
  const finalize = useMutation({ mutationFn: () => api.finalize(plan.id), onSuccess: update });
  const saved = ranking.length === 3 && JSON.stringify(ranking) === JSON.stringify(plan.my_vote ?? []);
  const voters = plan.participants.filter((person) => person.has_voted).length;
  const leader = [...plan.candidates].sort((a, b) => b.vote_score - a.vote_score || a.rank - b.rank)[0];

  const toggle = (candidateId: string) => setRanking((current) =>
    current.includes(candidateId) ? current.filter((value) => value !== candidateId)
      : current.length < 3 ? [...current, candidateId] : current);

  return (
    <>
      <View style={{ gap: space.sm }}>
        <Heading>Rank your top three</Heading>
        <Body muted>Tap in order of preference. Tap again to undo.</Body>
      </View>
      <View style={{ gap: space.md }}>
        {plan.candidates.map((candidate) => {
          const position = ranking.indexOf(candidate.id);
          return <PickCard key={candidate.id} candidate={candidate} rank={position >= 0 ? position : undefined} onToggle={() => toggle(candidate.id)} />;
        })}
      </View>
      {vote.isError ? <ErrorText>{errorMessage(vote.error)}</ErrorText> : null}
      {saved ? (
        <Body style={{ textAlign: "center", fontWeight: "600" }}>Vote saved. Tap the picks to change it.</Body>
      ) : (
        <Button
          label={ranking.length === 3 ? "Save my vote" : `Pick ${3 - ranking.length} more`}
          disabled={ranking.length !== 3}
          busy={vote.isPending}
          onPress={() => vote.mutate()}
        />
      )}
      {plan.viewer_is_organizer && leader ? (
        <Card emphasis="outlined">
          <Heading>Lock it in</Heading>
          <Body>{voters} of {plan.participants.length} voted. {voters ? `${leader.place.name} is in the lead.` : "Wait for votes, or decide now."}</Body>
          {finalize.isError ? <ErrorText>{errorMessage(finalize.error)}</ErrorText> : null}
          <Button kind="quiet" label={`Go with ${leader.place.name}`} busy={finalize.isPending} onPress={() => finalize.mutate()} />
        </Card>
      ) : null}
      <Button kind="quiet" label="None of these work? Change your wishes" onPress={() => router.push(`/wishes/${plan.id}`)} />
    </>
  );
}

function Decided({ plan }: { plan: Plan }) {
  const update = useUpdate(plan.id);
  const reopen = useMutation({ mutationFn: () => api.reopen(plan.id), onSuccess: update });
  const winner = plan.candidates.find((candidate) => candidate.id === plan.finalized_candidate_id);
  return (
    <View style={{ gap: space.md }}>
      <Title size={40}>You’re going to</Title>
      {winner ? <PickCard candidate={winner} winner /> : <Body>The chosen place couldn’t be loaded.</Body>}
      {plan.viewer_is_organizer ? (
        <>
          {reopen.isError ? <ErrorText>{errorMessage(reopen.error)}</ErrorText> : null}
          <Button kind="quiet" label="Reopen voting" busy={reopen.isPending} onPress={() => reopen.mutate()} />
        </>
      ) : null}
    </View>
  );
}

function OrganizerTools({ plan }: { plan: Plan }) {
  const keys = useKeys();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rotate = useMutation({
    mutationFn: () => api.newShareLink(plan.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.plan(plan.id) }),
  });
  const remove = useMutation({
    mutationFn: () => api.deletePlan(plan.id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: keys.plan(plan.id) });
      queryClient.invalidateQueries({ queryKey: keys.plans });
      router.back();
    },
  });
  return (
    <View style={{ gap: space.sm, marginTop: space.lg }}>
      {plan.status !== "finalized" ? (
        <Button kind="quiet" label="Make a new invite link" busy={rotate.isPending} onPress={() =>
          Alert.alert("Make a new link?", "The old link stops working for anyone who hasn't joined yet.", [
            { text: "Cancel", style: "cancel" },
            { text: "Make new link", onPress: () => rotate.mutate() },
          ])}
        />
      ) : null}
      <Button kind="danger" label="Delete this plan" busy={remove.isPending} onPress={() =>
        Alert.alert(`Delete "${plan.title}"?`, "This deletes the plan for everyone in it.", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => remove.mutate() },
        ])}
      />
      {remove.isError || rotate.isError ? <ErrorText>{errorMessage(remove.error ?? rotate.error)}</ErrorText> : null}
    </View>
  );
}
