import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme";

export default function Index() {
  const auth = useAuth();
  if (auth.phase === "loading") {
    return (
      <View accessibilityLabel="Restoring TableUs session" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <ActivityIndicator color={colors.accent} />
        <Text selectable style={{ color: colors.muted }}>Restoring your session…</Text>
      </View>
    );
  }
  return <Redirect href={auth.approved ? "/(tabs)/plans" : "/auth"} />;
}
