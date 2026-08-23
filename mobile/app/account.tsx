import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { MutationFeedback } from "@/components/mutation-feedback";
import type { AccountControl } from "@/lib/account-controls";
import { shareAccountExport } from "@/lib/account-export-file";
import { api } from "@/lib/api";
import { OFFLINE_REFRESH_MESSAGE, refreshWhenOnline } from "@/lib/offline-refresh";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";
import { useAuth } from "@/providers/auth-provider";
import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

type Profile = { display_name: string; share_taste: boolean };
type DeleteResult = { deleted: boolean };

const DELETE_CONFIRMATION = "DELETE";

export default function AccountScreen() {
  const auth = useAuth();
  const { isOnline } = useConnectivity();
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");
  const profile = useQuery({ queryKey: ["me"], queryFn: () => api.get<Profile>("/api/v1/me") });
  const control = useQuery({
    queryKey: ["account-control"],
    queryFn: () => api.get<AccountControl>("/api/v1/me/account-control"),
  });
  const exportData = useRecoverableMutation({
    mutationFn: async (_variables: undefined, _idempotencyKey: string) => {
      const data = await api.get<unknown>("/api/v1/me/export");
      await shareAccountExport(data);
    },
    onSuccess: () => {
      setMessage("Your TableUs application data export was prepared as a JSON file.");
    },
  });
  const deleteAccount = useRecoverableMutation({
    mutationFn: (_variables: undefined, idempotencyKey: string) => api.delete<DeleteResult>("/api/v1/me", { confirmation: DELETE_CONFIRMATION }, { idempotencyKey }),
    onSuccess: async () => {
      await auth.signOut();
    },
  });
  const error = profile.error ?? control.error;
  const refresh = async () => {
    const refreshed = await refreshWhenOnline(isOnline, () => Promise.all([profile.refetch(), control.refetch()]));
    setRefreshMessage(refreshed ? "" : OFFLINE_REFRESH_MESSAGE);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} refreshControl={<RefreshControl refreshing={profile.isRefetching || control.isRefetching} onRefresh={() => void refresh()} />}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>
          {profile.data?.display_name ?? "Your account"}
        </Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>
          Taste-profile sharing is currently {profile.data?.share_taste ? "on" : "off"}. Change it from your profile screen.
        </Text>
      </Card>

      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "800" }}>Session</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>
          Sign out on this device and clear its cached TableUs data.
        </Text>
        <Button label="Sign out" onPress={() => void auth.signOut()} loading={auth.busy} />
      </Card>

      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "800" }}>Export my data</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>
          Share a JSON copy of your profile, reviews, and participating plan identifiers using the system share sheet.
        </Text>
        <MutationFeedback failure={exportData.failure} canRetry={exportData.canRetry} retryLabel="Retry account export" onRetry={exportData.retry} onDismiss={exportData.reset} />
        <Button label="Export my data" onPress={() => exportData.submit(undefined)} loading={exportData.isPending} disabled={exportData.canRetry} />
      </Card>

      <View style={{ gap: 12, padding: 16, borderRadius: 20, borderCurve: "continuous", backgroundColor: "#fff1f2", borderWidth: 1, borderColor: "#fecdd3" }}>
        <Text selectable style={{ color: colors.danger, fontSize: 18, fontWeight: "800" }}>Delete application data</Text>
        <Text selectable style={{ color: colors.danger, lineHeight: 22 }}>
          This permanently removes your TableUs application profile. Organized plans must be transferred or removed first. Authentication records may require separate closed-beta operator removal.
        </Text>
        <Text selectable accessibilityLiveRegion="polite" style={{ color: colors.danger, fontWeight: "700" }}>
          {control.isPending
            ? "Checking deletion readiness…"
            : control.data?.can_delete
              ? "Application profile deletion is available. Supabase Auth removal remains operator-assisted."
              : `${control.data?.organized_plan_count ?? 0} organized plan${control.data?.organized_plan_count === 1 ? "" : "s"} must be transferred or removed first.`}
        </Text>
        <Text selectable style={{ color: colors.danger, fontWeight: "700" }}>Type DELETE to confirm</Text>
        <Field
          accessibilityLabel="Type DELETE to confirm account deletion"
          autoCapitalize="characters"
          autoComplete="off"
          value={confirmation}
          onChangeText={(value) => { deleteAccount.reset(); setConfirmation(value); }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete my application data"
          disabled={confirmation !== DELETE_CONFIRMATION || deleteAccount.isPending || deleteAccount.canRetry || !control.data?.can_delete}
          onPress={() => deleteAccount.submit(undefined)}
          style={({ pressed }) => ({
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            borderCurve: "continuous",
            backgroundColor: colors.danger,
            opacity: confirmation !== DELETE_CONFIRMATION || deleteAccount.isPending || deleteAccount.canRetry || !control.data?.can_delete ? 0.4 : pressed ? 0.75 : 1,
          })}
        >
          <Text selectable style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            {deleteAccount.isPending ? "Deleting…" : "Delete my application data"}
          </Text>
        </Pressable>
        <MutationFeedback failure={deleteAccount.failure} canRetry={deleteAccount.canRetry} retryLabel="Retry deleting application data" onRetry={deleteAccount.retry} onDismiss={deleteAccount.reset} />
      </View>

      {message ? <Text selectable accessibilityRole="alert" style={{ color: colors.accent }}>{message}</Text> : null}
      {refreshMessage ? <Text selectable accessibilityRole="alert" style={{ color: colors.muted }}>{refreshMessage}</Text> : null}
      {error ? <ErrorText message={error.message} /> : null}
    </ScrollView>
  );
}
