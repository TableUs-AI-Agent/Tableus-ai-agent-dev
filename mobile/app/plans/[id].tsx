import type { Plan } from "@tableus/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, Share, Text, View } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/theme";

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("group-friendly dinner");
  const [rankingDraft, setRankingDraft] = useState<{ planId: string; values: string[] } | null>(null);
  const key = ["plan", id];
  const plan = useQuery({ queryKey: key, queryFn: () => api.get<Plan>(`/api/v1/plans/${id}`), refetchInterval: 30_000 });
  const updateData = (data: Plan) => queryClient.setQueryData(key, data);
  const constraints = useMutation({ mutationFn: () => api.patch<Plan>(`/api/v1/plans/${id}/constraints`, { notes, cuisines: [], dietary_notes: [] }), onSuccess: (data) => { setRankingDraft(null); updateData(data); } });
  const recommend = useMutation({ mutationFn: () => api.post<Plan>(`/api/v1/plans/${id}/recommendations`, { query }), onSuccess: (data) => { setRankingDraft(null); updateData(data); } });
  const vote = useMutation({ mutationFn: () => api.put<Plan>(`/api/v1/plans/${id}/vote`, { ranking }), onSuccess: (data) => { setRankingDraft(null); updateData(data); } });
  const finalize = useMutation({ mutationFn: () => api.post<Plan>(`/api/v1/plans/${id}/finalize`, {}), onSuccess: updateData });
  const reopen = useMutation({ mutationFn: () => api.post<Plan>(`/api/v1/plans/${id}/reopen`, {}), onSuccess: updateData });
  const rotate = useMutation({
    mutationFn: () => api.post<{ share_token: string }>(`/api/v1/plans/${id}/share-token/rotate`),
    onSuccess: ({ share_token }) => Share.share({ message: Linking.createURL(`/join/${id}`, { queryParams: { token: share_token } }) }),
  });
  const current = plan.data;
  const ranking = rankingDraft?.planId === id ? rankingDraft.values : current?.my_vote ?? [];
  const error = plan.error || constraints.error || recommend.error || vote.error || finalize.error || reopen.error || rotate.error;

  const choose = (candidateId: string) => {
    vote.reset();
    const values = ranking.includes(candidateId) ? ranking.filter((item) => item !== candidateId) : ranking.length < 3 ? [...ranking, candidateId] : ranking;
    setRankingDraft({ planId: id, values });
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} refreshControl={<RefreshControl refreshing={plan.isRefetching} onRefresh={plan.refetch} />}>
      {error ? <ErrorText message={error.message} /> : null}
      {current ? (
        <>
          <Card>
            <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "800" }}>{current.title}</Text>
            <Text selectable style={{ color: colors.muted }}>{current.location_label} · {current.participants.length}/8 people · {current.status}</Text>
            <Text selectable style={{ color: colors.muted }}>{current.participants.map((person) => person.display_name).join(", ")}</Text>
            {current.viewer_is_organizer ? <Button label="Create a fresh private join link" onPress={() => rotate.mutate()} loading={rotate.isPending} /> : null}
          </Card>
          {current.status !== "finalized" ? (
            <Card>
              <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Your constraints</Text>
              <Field value={notes} onChangeText={(value) => { constraints.reset(); setNotes(value); }} placeholder="Budget, vibe, dietary notes…" multiline />
              <Button label="Save constraints" onPress={() => constraints.mutate()} loading={constraints.isPending} />
              {constraints.isSuccess ? <Text selectable accessibilityRole="alert" style={{ color: colors.green }}>Constraints saved.</Text> : null}
              {current.status === "voting" ? (
                <Text selectable style={{ color: colors.muted, lineHeight: 21 }}>Saving changed constraints returns the plan to collecting and clears the current recommendations and votes.</Text>
              ) : (
                <>
                  <Field value={query} onChangeText={setQuery} placeholder="What should the group find?" />
                  <Button label="Find four options" onPress={() => recommend.mutate()} loading={recommend.isPending} disabled={current.participants.length < 2} />
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
                {candidate.place.data_provider === "google_maps" ? <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>Restaurant data provided by Google Maps</Text> : null}
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
              <Button label="Submit ranked vote" onPress={() => vote.mutate()} disabled={ranking.length !== 3} loading={vote.isPending} />
              {current.my_vote ? <Text selectable accessibilityRole="alert" style={{ color: colors.green }}>Ranked vote saved.</Text> : null}
              {current.viewer_is_organizer ? <Button label="Finalize current winner" onPress={() => finalize.mutate()} loading={finalize.isPending} /> : null}
            </Card>
          ) : null}
          {current.status === "finalized" && current.viewer_is_organizer ? <Button label="Reopen voting" onPress={() => reopen.mutate()} loading={reopen.isPending} /> : null}
        </>
      ) : null}
    </ScrollView>
  );
}
