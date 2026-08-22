import { Text, View } from "react-native";

import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

export function ConnectivityBanner() {
  const { isOnline } = useConnectivity();
  if (isOnline) return null;
  return (
    <View accessible accessibilityRole="alert" accessibilityLiveRegion="assertive" style={{ backgroundColor: colors.danger, paddingHorizontal: 16, paddingVertical: 9 }}>
      <Text selectable style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>
        Offline. Changes are not sent or queued.
      </Text>
    </View>
  );
}
