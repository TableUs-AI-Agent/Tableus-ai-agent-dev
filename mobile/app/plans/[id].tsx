import type { Plan } from "@tableus/domain";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, Share, Text, View } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { MutationFeedback } from "@/components/mutation-feedback";
import { GoogleMapsAttribution } from "@/components/google-maps-attribution";
import { api } from "@/lib/api";
import { createCanonicalJoinUrl } from "@/lib/links";
import { OFFLINE_REFRESH_MESSAGE, refreshWhenOnline } from "@/lib/offline-refresh";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";
import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isOnline } = useConnectivity();
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("group-friendly dinner");
  const [refreshMessage, setRefreshMessage] = useState("");
  const [rankingDraft, setRankingDraft] = useState<{ planId: string; values: string[] } | null>(null);
  const key = ["plan", id];
  const plan = useQuery({ queryKey: key, queryFn: () => api.get<Plan>(`/api/v1/plans/${id}`), refetchInterval: 30_000 });
  const updateData = (data: Plan) => { queryClient.setQueryData(key, data); };
  const constraints = useRecoverableMutation({
    mutationFn: (body: { notes: string; cuisines: string[]; dietary_notes: string[] }, idempotencyKey) => api.patch<Plan>(`/api/v1/plans/${id}/constraints`, body, { idempotencyKey }),
    onSuccess: (data) => { setRankingDraft(null); updateData(data); },
  });
  const recommend = useRecoverableMutation({
    mutationFn: (searchQuery: string, idempotencyKey) => api.post<Plan>(`/api/v1/plans/${id}/recommendations`, { query: searchQuery }, { idempotencyKey }),
    onSuccess: (data) => { setRankingDraft(null); updateData(data); },
  });
  const vote = useRecoverableMutation({
    mutationFn: (rankingValues: string[], idempotencyKey) => api.put<Plan>(`/api/v1/plans/${id}/vote`, { ranking: rankingValues }, { idempotencyKey }),
    onSuccess: (data) => { setRankingDraft(null); updateData(data); },
  });
  const finalize = useRecoverableMutation({
    mutationFn: (_variables: undefined, idempotencyKey: string) => api.post<Plan>(`/api/v1/plans/${id}/finalize`, {}, { idempotencyKey }),
    onSuccess: updateData,
  });
  const reopen = useRecoverableMutation({
    mutationFn: (_variables: undefined, idempotencyKey: string) => api.post<Plan>(`/api/v1/plans/${id}/reopen`, {}, { idempotencyKey }),
    onSuccess: updateData,
  });
  const rotate = useRecoverableMutation({
    mutationFn: (_variables: undefined, idempotencyKey: string) => api.post<{ share_token: string }>(`/api/v1/plans/${id}/share-token/rotate`, {}, { idempotencyKey }),
    onSuccess: async ({ share_token }) => { await Share.share({ message: createCanonicalJoinUrl(id, share_token) }); },
  });
  const current = plan.data;
  const ranking = rankingDraft?.planId === id ? rankingDraft.values : current?.my_vote ?? [];
  const error = plan.error;

  const choose = (candidateId: string) => {
    vote.reset();
    const values = ranking.includes(candidateId) ? ranking.filter((item) => item !== candidateId) : ranking.length < 3 ? [...ranking, candidateId] : ranking;
    setRankingDraft({ planId: id, values });
  };

  const refresh = async () => {
    const refreshed = await refreshWhenOnline(isOnline, plan.refetch);
    setRefreshMessage(refreshed ? "" : OFFLINE_REFRESH_MESSAGE);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} refreshControl={<RefreshControl refreshing={plan.isRefetching} onRefresh={() => void refresh()} />}>
      {error ? <ErrorText message={error.message} /> : null}
      {refreshMessage ? <Text selectable accessibilityRole="alert" style={{ color: colors.muted }}>{refreshMessage}</Text> : null}
      {current ? (
        <>
          <Card>
            <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "800" }}>{current.title}</Text>
            <Text selectable style={{ color: colors.muted }}>{current.location_label} · {current.participants.length}/8 people · {current.status}</Text>
            <Text selectable style={{ color: colors.muted }}>{current.participants.map((person) => person.display_name).join(", ")}</Text>
            {current.viewer_is_organizer ? (
              <>
                <MutationFeedback failure={rotate.failure} canRetry={rotate.canRetry} retryLabel="Retry private link rotation" onRetry={rotate.retry} onDismiss={rotate.reset} />
                <Button label="Create a fresh private join link" onPress={() => rotate.submit(undefined)} loading={rotate.isPending} disabled={rotate.canRetry} />
              </>
            ) : null}
          </Card>
          {current.status !== "finalized" ? (
            <Card>
              <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Your constraints</Text>
              <Field value={notes} onChangeText={(value) => { constraints.reset(); setNotes(value); }} placeholder="Budget, vibe, dietary notes…" multiline />
              <MutationFeedback failure={constraints.failure} canRetry={constraints.canRetry} retryLabel="Retry saving constraints" onRetry={constraints.retry} onDismiss={constraints.reset} />
              <Button label="Save constraints" onPress={() => constraints.submit({ notes, cuisines: [], dietary_notes: [] })} loading={constraints.isPending} disabled={constraints.canRetry} />
              {constraints.isSuccess ? <Text selectable accessibilityRole="alert" style={{ color: colors.green }}>Constraints saved.</Text> : null}
              {current.status === "voting" ? (
                <Text selectable style={{ color: colors.muted, lineHeight: 21 }}>Saving changed constraints returns the plan to collecting and clears the current recommendations and votes.</Text>
              ) : (
                <>
                  <Field value={query} onChangeText={(value) => { recommend.reset(); setQuery(value); }} placeholder="What should the group find?" />
                  <MutationFeedback failure={recommend.failure} canRetry={recommend.canRetry} retryLabel="Retry finding options" onRetry={recommend.retry} onDismiss={recommend.reset} />
                  <Button label="Find four options" onPress={() => recommend.submit(query)} loading={recommend.isPending} disabled={current.participants.length < 2 || recommend.canRetry} />
                  {current.participants.length < 2 ? <Text selectable style={{ color: colors.muted }}>A second invite-approved diner must join before recommendations are generated.</Text> : null}
                </>
              )}
            </Card>
          ) : null}
          {current.candidates.map((candidate) => {
            const selectedIndex = ranking.indexOf(candidate.id);
            const finalized = current.finalized_candidate_id === candidate.id;
            return (
              <Card key={candidate.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                  <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700", flex: 1 }}>{candidate.place.name}</Text>
                  <Text
                    selectable
                    accessibilityLabel={`${candidate.place.name} score ${candidate.vote_score} points${finalized ? ", chosen" : selectedIndex >= 0 ? `, rank ${selectedIndex + 1}` : ""}`}
                    style={{ color: finalized ? colors.green : colors.accent, fontWeight: "700" }}
                  >
                    {finalized ? `Chosen · ${candidate.vote_score} pts` : selectedIndex >= 0 ? `#${selectedIndex + 1} · ${candidate.vote_score} pts` : `${candidate.vote_score} pts`}
                  </Text>
                </View>
                <Text selectable style={{ color: colors.muted }}>{candidate.place.cuisine} · {"$".repeat(candidate.place.price_level)} · {candidate.place.rating.toFixed(1)}</Text>
                <Text selectable style={{ color: colors.muted, lineHeight: 21 }}>{candidate.reasoning}</Text>
                {candidate.place.data_provider === "google_maps" ? <GoogleMapsAttribution /> : null}
                {current.status === "voting" ? (
                  <Button
                    label={selectedIndex >= 0 ? `Remove ${candidate.place.name} from rank ${selectedIndex + 1}` : `Rank ${candidate.place.name}`}
                    onPress={() => choose(candidate.id)}
                    disabled={selectedIndex < 0 && ranking.length >= 3}
                  />
                ) : null}
                <Button label={`Open ${candidate.place.name} in Maps`} onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(candidate.place.place_id)}`)} />
              </Card>
            );
          })}
          {current.status === "voting" ? (
            <Card>
              <Text selectable style={{ color: colors.muted }}>Tap your first, second, and third choices in order.</Text>
              <MutationFeedback failure={vote.failure} canRetry={vote.canRetry} retryLabel="Retry ranked vote" onRetry={vote.retry} onDismiss={vote.reset} />
              <Button label="Submit ranked vote" onPress={() => vote.submit([...ranking])} disabled={ranking.length !== 3 || vote.canRetry} loading={vote.isPending} />
              {current.my_vote ? <Text selectable accessibilityRole="alert" style={{ color: colors.green }}>Ranked vote saved.</Text> : null}
              {current.viewer_is_organizer ? (
                <>
                  <MutationFeedback failure={finalize.failure} canRetry={finalize.canRetry} retryLabel="Retry finalizing plan" onRetry={finalize.retry} onDismiss={finalize.reset} />
                  <Button label="Finalize current winner" onPress={() => finalize.submit(undefined)} loading={finalize.isPending} disabled={finalize.canRetry} />
                </>
              ) : null}
            </Card>
          ) : null}
          {current.status === "finalized" && current.viewer_is_organizer ? (
            <>
              <MutationFeedback failure={finalize.failure} canRetry={finalize.canRetry} retryLabel="Retry finalizing plan" onRetry={finalize.retry} onDismiss={finalize.reset} />
              <MutationFeedback failure={reopen.failure} canRetry={reopen.canRetry} retryLabel="Retry reopening voting" onRetry={reopen.retry} onDismiss={reopen.reset} />
              <Button label="Reopen voting" onPress={() => reopen.submit(undefined)} loading={reopen.isPending} disabled={reopen.canRetry} />
            </>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}
