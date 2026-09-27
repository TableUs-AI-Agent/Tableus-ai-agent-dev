import { Tabs } from "expo-router";

import { colors } from "@/theme";

export default function TabsLayout() {
  return (
    <Tabs initialRouteName="plans" screenOptions={{ headerShown: true, tabBarActiveTintColor: colors.accent, tabBarStyle: { backgroundColor: colors.surface } }}>
      <Tabs.Screen name="plans" options={{ title: "Plans" }} />
      <Tabs.Screen name="settings" options={{ title: "Account" }} />
      <Tabs.Screen name="people" options={{ href: null }} />
      <Tabs.Screen name="review" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
