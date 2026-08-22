import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, Switch, Text, View } from "react-native";

import { Button, Card, ErrorText } from "@/components/ui";
import { MutationFeedback } from "@/components/mutation-feedback";
import { api } from "@/lib/api";
import { OFFLINE_REFRESH_MESSAGE, refreshWhenOnline } from "@/lib/offline-refresh";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";
import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

type Profile = { id: string; display_name: string; taste_profile: string; share_taste: boolean };

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { isOnline } = useConnectivity();
  const [shareTasteDraft, setShareTasteDraft] = useState<boolean | null>(null);
  const [refreshMessage, setRefreshMessage] = useState("");
  const profile = useQuery({ queryKey: ["me"], queryFn: () => api.get<Profile>("/api/v1/me") });
  const update = useRecoverableMutation({
    mutationFn: (share_taste: boolean, idempotencyKey) => api.patch<Profile>("/api/v1/me", { share_taste }, { idempotencyKey }),
    onSuccess: (data) => { queryClient.setQueryData(["me"], data); setShareTasteDraft(null); },
  });
  const regenerate = useRecoverableMutation({
    mutationFn: (_variables: undefined, idempotencyKey: string) => api.post<{ preferences_text: string }>("/api/v1/taste-profile/regenerate", {}, { idempotencyKey }),
  });
  const refresh = async () => {
    const refreshed = await refreshWhenOnline(isOnline, profile.refetch);
    setRefreshMessage(refreshed ? "" : OFFLINE_REFRESH_MESSAGE);
  };
  const dismissUpdate = () => { update.reset(); setShareTasteDraft(null); };
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} refreshControl={<RefreshControl refreshing={profile.isRefetching} onRefresh={() => void refresh()} />}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>{profile.data?.display_name ?? "Your profile"}</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>{regenerate.data?.preferences_text || profile.data?.taste_profile || "Add reviews, then generate an optional taste summary."}</Text>
        <MutationFeedback failure={regenerate.failure} canRetry={regenerate.canRetry} retryLabel="Retry taste summary" onRetry={regenerate.retry} onDismiss={regenerate.reset} />
        <Button label="Regenerate taste summary" onPress={() => regenerate.submit(undefined)} loading={regenerate.isPending} disabled={regenerate.canRetry} />
      </Card>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Text selectable style={{ color: colors.ink, flex: 1 }}>Share taste summary with plan participants</Text>
          <Switch
            accessibilityLabel="Share taste summary"
            value={shareTasteDraft ?? profile.data?.share_taste ?? false}
            disabled={update.isPending || update.canRetry}
            onValueChange={(value) => { update.reset(); setShareTasteDraft(value); update.submit(value); }}
          />
        </View>
        <MutationFeedback failure={update.failure} canRetry={update.canRetry} retryLabel="Retry taste-sharing change" onRetry={update.retry} onDismiss={dismissUpdate} />
        {profile.error ? <ErrorText message={profile.error.message} /> : null}
      </Card>
      {refreshMessage ? <Text selectable accessibilityRole="alert" style={{ color: colors.muted }}>{refreshMessage}</Text> : null}
      <Link href="/account" style={{ color: colors.accent }}>Account and data</Link>
      <Link href="/privacy" style={{ color: colors.accent }}>Privacy</Link>
      <Link href="/terms" style={{ color: colors.accent }}>Terms</Link>
    </ScrollView>
  );
}
