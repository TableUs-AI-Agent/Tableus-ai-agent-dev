import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card } from "@/components/ui";
import { isConnectivityOverride, setConnectivityOverride } from "@/lib/connectivity";
import { localE2EEnabled } from "@/lib/e2e-identity";
import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

export default function ConnectivityE2EScreen() {
  const { state } = useLocalSearchParams<{ state?: string }>();
  const { override } = useConnectivity();
  const requested = isConnectivityOverride(state) ? state : null;

  useEffect(() => {
    if (localE2EEnabled && requested) setConnectivityOverride(requested);
  }, [requested]);

  if (!localE2EEnabled) return <Redirect href="/" />;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>Local connectivity control</Text>
        <Text selectable accessibilityRole="alert" style={{ color: colors.ink }}>
          {requested ? `Connectivity override: ${requested}` : "Invalid connectivity override."}
        </Text>
        <Text selectable style={{ color: colors.muted }}>Active override: {override}</Text>
        <Button label="Return to previous screen" onPress={() => router.back()} />
      </Card>
    </ScrollView>
  );
}
