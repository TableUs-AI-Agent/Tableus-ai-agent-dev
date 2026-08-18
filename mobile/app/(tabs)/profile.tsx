import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { ScrollView, Switch, Text, View } from "react-native";

import { Button, Card, ErrorText } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/theme";

type Profile = { id: string; display_name: string; taste_profile: string; share_taste: boolean };

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["me"], queryFn: () => api.get<Profile>("/api/v1/me") });
  const update = useMutation({
    mutationFn: (share_taste: boolean) => api.patch<Profile>("/api/v1/me", { share_taste }),
    onSuccess: (data) => queryClient.setQueryData(["me"], data),
  });
  const regenerate = useMutation({ mutationFn: () => api.post<{ preferences_text: string }>("/api/v1/taste-profile/regenerate") });
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>{profile.data?.display_name ?? "Your profile"}</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>{regenerate.data?.preferences_text || profile.data?.taste_profile || "Add reviews, then generate an optional taste summary."}</Text>
        <Button label="Regenerate taste summary" onPress={() => regenerate.mutate()} loading={regenerate.isPending} />
      </Card>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Text selectable style={{ color: colors.ink, flex: 1 }}>Share taste summary with plan participants</Text>
          <Switch value={profile.data?.share_taste ?? false} onValueChange={(value) => update.mutate(value)} />
        </View>
        {profile.error ? <ErrorText message={profile.error.message} /> : null}
      </Card>
      <Link href="/privacy" style={{ color: colors.accent }}>Privacy</Link>
      <Link href="/terms" style={{ color: colors.accent }}>Terms</Link>
    </ScrollView>
  );
}
