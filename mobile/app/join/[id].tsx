import type { Plan } from "@tableus/domain";
import { ApiError } from "@tableus/api-client";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text } from "react-native";

import { Button, Card } from "@/components/ui";
import { MutationFeedback } from "@/components/mutation-feedback";
import { api } from "@/lib/api";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme";

export default function JoinPlanScreen() {
  const { id, token } = useLocalSearchParams<{ id: string; token?: string }>();
  const auth = useAuth();
  const join = useRecoverableMutation({
    mutationFn: (shareToken: string, idempotencyKey) => api.post<Plan>(`/api/v1/plans/${id}/join`, { share_token: shareToken }, { idempotencyKey }),
    onSuccess: () => router.replace({ pathname: "/plans/[id]", params: { id } }),
  });
  const invalidLink = !token || (join.failure?.error instanceof ApiError && join.failure.error.status === 404);
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "800" }}>Join this TableUs plan?</Text>
        <Text selectable style={{ color: colors.muted }}>Only authenticated, invite-approved users with the current private link can join.</Text>
        {!auth.approved ? (
          <>
            <Text selectable accessibilityRole="alert" style={{ color: colors.ink, fontWeight: "700" }}>Authentication required</Text>
            <Button label="Sign in to join" onPress={() => router.push({ pathname: "/auth", params: { mode: "sign-in" } })} />
          </>
        ) : (
          <>
            {invalidLink ? <Text selectable accessibilityRole="alert" accessibilityLiveRegion="assertive" style={{ color: colors.danger }}>This private link is invalid, expired, or has been rotated.</Text> : <MutationFeedback failure={join.failure} canRetry={join.canRetry} retryLabel="Retry joining plan" onRetry={join.retry} onDismiss={join.reset} />}
            <Button label="Join this plan" onPress={() => token && join.submit(token)} loading={join.isPending} disabled={invalidLink || join.canRetry} />
          </>
        )}
      </Card>
    </ScrollView>
  );
}
