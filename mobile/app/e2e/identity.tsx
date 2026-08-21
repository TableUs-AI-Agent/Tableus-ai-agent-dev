import { useQueryClient } from "@tanstack/react-query";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card, ErrorText } from "@/components/ui";
import { isLocalE2EIdentity, type LocalE2EIdentity } from "@/lib/e2e-config";
import { localE2EEnabled, localE2EIdentityName, setLocalE2EIdentity } from "@/lib/e2e-identity";
import { colors } from "@/theme";

export default function LocalE2EIdentityScreen() {
  const { user } = useLocalSearchParams<{ user?: string | string[] }>();
  const queryClient = useQueryClient();
  const [active, setActive] = useState<LocalE2EIdentity | null>(null);
  const [error, setError] = useState("");
  const requested = Array.isArray(user) ? user[0] : user;
  const validRequested = isLocalE2EIdentity(requested) ? requested : null;

  useEffect(() => {
    if (!localE2EEnabled || !validRequested) return;
    let cancelled = false;
    void setLocalE2EIdentity(validRequested)
      .then(() => {
        if (cancelled) return;
        queryClient.clear();
        setActive(validRequested);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not switch test identity.");
      });
    return () => { cancelled = true; };
  }, [queryClient, validRequested]);

  if (!localE2EEnabled) return <Redirect href="/" />;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>Local E2E identity</Text>
        {active ? (
          <>
            <Text selectable accessibilityRole="alert" style={{ color: colors.green, lineHeight: 22 }}>
              Active test identity: {localE2EIdentityName(active)}
            </Text>
            <Button label="Continue to plans" onPress={() => router.replace("/(tabs)/plans")} />
          </>
        ) : null}
        {!active && !error ? <Text selectable style={{ color: colors.muted }}>Switching identity…</Text> : null}
        {!validRequested ? <ErrorText message="Unsupported local E2E identity." /> : null}
        {error ? <ErrorText message={error} /> : null}
      </Card>
    </ScrollView>
  );
}
