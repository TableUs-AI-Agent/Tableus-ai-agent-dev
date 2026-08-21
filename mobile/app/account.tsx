import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme";

type Profile = { display_name: string; share_taste: boolean };
type DeleteResult = { deleted: boolean };

const DELETE_CONFIRMATION = "DELETE";

export default function AccountScreen() {
  const auth = useAuth();
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const profile = useQuery({ queryKey: ["me"], queryFn: () => api.get<Profile>("/api/v1/me") });
  const exportData = useMutation({
    mutationFn: () => api.get<unknown>("/api/v1/me/export"),
    onSuccess: async (data) => {
      await Share.share({
        title: "TableUs data export",
        message: JSON.stringify(data, null, 2),
      });
      setMessage("Your TableUs application data export is ready in the share sheet.");
    },
  });
  const deleteAccount = useMutation({
    mutationFn: () => api.delete<DeleteResult>("/api/v1/me"),
    onSuccess: async () => {
      await auth.signOut();
    },
  });
  const error = profile.error ?? exportData.error ?? deleteAccount.error;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }}>
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
        <Button label="Export my data" onPress={() => exportData.mutate()} loading={exportData.isPending} />
      </Card>

      <View style={{ gap: 12, padding: 16, borderRadius: 20, borderCurve: "continuous", backgroundColor: "#fff1f2", borderWidth: 1, borderColor: "#fecdd3" }}>
        <Text selectable style={{ color: colors.danger, fontSize: 18, fontWeight: "800" }}>Delete application data</Text>
        <Text selectable style={{ color: colors.danger, lineHeight: 22 }}>
          This permanently removes your TableUs application profile. Organized plans must be transferred or removed first. Authentication records may require separate closed-beta operator removal.
        </Text>
        <Text selectable style={{ color: colors.danger, fontWeight: "700" }}>Type DELETE to confirm</Text>
        <Field
          accessibilityLabel="Type DELETE to confirm account deletion"
          autoCapitalize="characters"
          autoComplete="off"
          value={confirmation}
          onChangeText={setConfirmation}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete my application data"
          disabled={confirmation !== DELETE_CONFIRMATION || deleteAccount.isPending}
          onPress={() => deleteAccount.mutate()}
          style={({ pressed }) => ({
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            borderCurve: "continuous",
            backgroundColor: colors.danger,
            opacity: confirmation !== DELETE_CONFIRMATION || deleteAccount.isPending ? 0.4 : pressed ? 0.75 : 1,
          })}
        >
          <Text selectable style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            {deleteAccount.isPending ? "Deleting…" : "Delete my application data"}
          </Text>
        </Pressable>
      </View>

      {message ? <Text selectable accessibilityRole="alert" style={{ color: colors.accent }}>{message}</Text> : null}
      {error ? <ErrorText message={error.message} /> : null}
    </ScrollView>
  );
}
