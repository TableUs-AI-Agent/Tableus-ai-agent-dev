import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/theme";

type Connection = { profile_id: string; display_name: string; taste_profile: string | null };

export default function PeopleScreen() {
  const client = useQueryClient();
  const [profileId, setProfileId] = useState("");
  const connections = useQuery({ queryKey: ["connections"], queryFn: () => api.get<Connection[]>("/api/v1/connections") });
  const add = useMutation({
    mutationFn: () => api.post<Connection>("/api/v1/connections", { profile_id: profileId }),
    onSuccess: () => { setProfileId(""); client.invalidateQueries({ queryKey: ["connections"] }); },
  });
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: "800" }}>Invite-approved people</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>Connect by exact profile ID. Taste summaries appear only when that person opts in.</Text>
        <Field value={profileId} onChangeText={setProfileId} placeholder="Profile ID" autoCapitalize="none" />
        {add.error ? <ErrorText message={add.error.message} /> : null}
        <Button label="Add connection" onPress={() => add.mutate()} disabled={!profileId} loading={add.isPending} />
      </Card>
      {connections.error ? <ErrorText message={connections.error.message} /> : null}
      {(connections.data ?? []).map((person) => <Card key={person.profile_id}><Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>{person.display_name}</Text><Text selectable style={{ color: colors.muted }}>{person.taste_profile ?? "Taste profile is private."}</Text></Card>)}
    </ScrollView>
  );
}
