import { Redirect } from "expo-router";

// The deferred feature remains in src/screens/deferred for a later objective.
export default function DeferredRoute() {
  return <Redirect href="/(tabs)/plans" />;
}
