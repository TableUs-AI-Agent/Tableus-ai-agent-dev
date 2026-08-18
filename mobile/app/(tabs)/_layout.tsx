import { Tabs } from "expo-router";

import { colors } from "@/theme";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true, tabBarActiveTintColor: colors.accent, tabBarStyle: { backgroundColor: colors.surface } }}>
      <Tabs.Screen name="plans" options={{ title: "Plans" }} />
      <Tabs.Screen name="people" options={{ title: "People" }} />
      <Tabs.Screen name="review" options={{ title: "Review" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
