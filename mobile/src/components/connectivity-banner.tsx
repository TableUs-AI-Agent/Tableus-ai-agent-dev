import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

export function ConnectivityBanner() {
  const { isOnline } = useConnectivity();
  if (isOnline) return null;
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: colors.danger }}
      testID="connectivity-banner-safe-area"
    >
      <View
        accessible
        accessibilityLabel="Offline. Changes are not sent or queued."
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        style={{ paddingHorizontal: 16, paddingVertical: 9 }}
      >
        <Text selectable style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>
          Offline. Changes are not sent or queued.
        </Text>
      </View>
    </SafeAreaView>
  );
}
