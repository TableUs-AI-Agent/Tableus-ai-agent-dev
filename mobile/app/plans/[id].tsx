import type { Plan } from "@tableus/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Share, Text, View } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/theme";

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("group-friendly dinner");
  const [ranking, setRanking] = useState<string[]>([]);
  const key = ["plan", id];
  const plan = useQuery({ queryKey: key, queryFn: () => api.get<Plan>(`/api/v1/plans/${id}`), refetchInterval: 30_000 });
  const updateData = (data: Plan) => queryClient.setQueryData(key, data);
  const constraints = useMutation({ mutationFn: () => api.patch<Plan>(`/api/v1/plans/${id}/constraints`, { notes, cuisines: [], dietary_notes: [] }), onSuccess: updateData });
  const recommend = useMutation({ mutationFn: () => api.post<Plan>(`/api/v1/plans/${id}/recommendations`, { query }), onSuccess: updateData });
  const vote = useMutation({ mutationFn: () => api.put<Plan>(`/api/v1/plans/${id}/vote`, { ranking }), onSuccess: updateData });
  const finalize = useMutation({ mutationFn: () => api.post<Plan>(`/api/v1/plans/${id}/finalize`, {}), onSuccess: updateData });
  const reopen = useMutation({ mutationFn: () => api.post<Plan>(`/api/v1/plans/${id}/reopen`, {}), onSuccess: updateData });
  const rotate = useMutation({
    mutationFn: () => api.post<{ share_token: string }>(`/api/v1/plans/${id}/share-token/rotate`),
    onSuccess: ({ share_token }) => Share.share({ message: Linking.createURL(`/join/${id}`, { queryParams: { token: share_token } }) }),
  });
  const current = plan.data;
  const error = plan.error || constraints.error || recommend.error || vote.error || finalize.error || reopen.error || rotate.error;

  const choose = (candidateId: string) => {
    setRanking((previous) => previous.includes(candidateId) ? previous.filter((item) => item !== candidateId) : previous.length < 3 ? [...previous, candidateId] : previous);
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
          {current.status === "collecting" ? (
            <Card>
              <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Your constraints</Text>
              <Field value={notes} onChangeText={setNotes} placeholder="Budget, vibe, dietary notes…" multiline />
              <Button label="Save constraints" onPress={() => constraints.mutate()} loading={constraints.isPending} />
              <Field value={query} onChangeText={setQuery} placeholder="What should the group find?" />
              <Button label="Find four options" onPress={() => recommend.mutate()} loading={recommend.isPending} disabled={current.participants.length < 2} />
              {current.participants.length < 2 ? <Text selectable style={{ color: colors.muted }}>A second invite-approved diner must join before recommendations are generated.</Text> : null}
            </Card>
          ) : null}
          {current.candidates.map((candidate) => {
            const selectedIndex = ranking.indexOf(candidate.id);
            const finalized = current.finalized_candidate_id === candidate.id;
            return (
              <Pressable key={candidate.id} onPress={() => current.status === "voting" && choose(candidate.id)}>
                <Card>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                    <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700", flex: 1 }}>{candidate.place.name}</Text>
                    <Text selectable style={{ color: finalized ? colors.green : colors.accent, fontWeight: "700" }}>{finalized ? "Chosen" : selectedIndex >= 0 ? `#${selectedIndex + 1}` : `${candidate.vote_score} pts`}</Text>
                  </View>
                  <Text selectable style={{ color: colors.muted }}>{candidate.place.cuisine} · {"$".repeat(candidate.place.price_level)} · {candidate.place.rating.toFixed(1)}</Text>
                  <Text selectable style={{ color: colors.muted, lineHeight: 21 }}>{candidate.reasoning}</Text>
                  {candidate.place.data_provider === "google_maps" ? <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>Restaurant data provided by Google Maps</Text> : null}
                  <Button label="Open in Maps" onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(candidate.place.place_id)}`)} />
                </Card>
              </Pressable>
            );
          })}
          {current.status === "voting" ? (
            <Card>
              <Text selectable style={{ color: colors.muted }}>Tap your first, second, and third choices in order.</Text>
              <Button label="Submit ranked vote" onPress={() => vote.mutate()} disabled={ranking.length !== 3} loading={vote.isPending} />
              {current.viewer_is_organizer ? <Button label="Finalize current winner" onPress={() => finalize.mutate()} loading={finalize.isPending} /> : null}
            </Card>
          ) : null}
          {current.status === "finalized" && current.viewer_is_organizer ? <Button label="Reopen voting" onPress={() => reopen.mutate()} loading={reopen.isPending} /> : null}
        </>
      ) : null}
    </ScrollView>
  );
}
