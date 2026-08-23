import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl, ScrollView, Text } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { MutationFeedback } from "@/components/mutation-feedback";
import { api } from "@/lib/api";
import { OFFLINE_REFRESH_MESSAGE, refreshWhenOnline } from "@/lib/offline-refresh";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";
import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

type Connection = { profile_id: string; display_name: string; taste_profile: string | null };

export default function PeopleScreen() {
  const client = useQueryClient();
  const { isOnline } = useConnectivity();
  const [profileId, setProfileId] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");
  const connections = useQuery({ queryKey: ["connections"], queryFn: () => api.get<Connection[]>("/api/v1/connections") });
  const add = useRecoverableMutation({
    mutationFn: (body: { profile_id: string }, idempotencyKey) => api.post<Connection>("/api/v1/connections", body, { idempotencyKey }),
    onSuccess: () => { setProfileId(""); client.invalidateQueries({ queryKey: ["connections"] }); },
  });
  const refresh = async () => {
    const refreshed = await refreshWhenOnline(isOnline, connections.refetch);
    setRefreshMessage(refreshed ? "" : OFFLINE_REFRESH_MESSAGE);
  };
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} refreshControl={<RefreshControl refreshing={connections.isRefetching} onRefresh={() => void refresh()} />}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: "800" }}>Invite-approved people</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>Connect by exact profile ID. Taste summaries appear only when that person opts in.</Text>
        <Field value={profileId} onChangeText={(value) => { add.reset(); setProfileId(value); }} placeholder="Profile ID" autoCapitalize="none" />
        <MutationFeedback failure={add.failure} canRetry={add.canRetry} retryLabel="Retry adding connection" onRetry={add.retry} onDismiss={add.reset} />
        <Button label="Add connection" onPress={() => add.submit({ profile_id: profileId })} disabled={!profileId || add.canRetry} loading={add.isPending} />
      </Card>
      {refreshMessage ? <Text selectable accessibilityRole="alert" style={{ color: colors.muted }}>{refreshMessage}</Text> : null}
      {connections.error ? <ErrorText message={connections.error.message} /> : null}
      {(connections.data ?? []).map((person) => <Card key={person.profile_id}><Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>{person.display_name}</Text><Text selectable style={{ color: colors.muted }}>{person.taste_profile ?? "Taste profile is private."}</Text></Card>)}
    </ScrollView>
  );
}
