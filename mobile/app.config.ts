import type { ConfigContext, ExpoConfig } from "expo/config";
import { PUBLIC_RUNTIME_POLICY } from "@tableus/domain";

export default ({ config }: ConfigContext): ExpoConfig => {
  const linkHost = process.env.EXPO_PUBLIC_LINK_HOST ?? PUBLIC_RUNTIME_POLICY.linkHost;
  const development = process.env.EAS_BUILD_PROFILE === "development" || !process.env.EAS_BUILD_PROFILE;
  return {
    ...config,
    name: "TableUs",
    slug: "tableus",
    owner: "tableus",
    scheme: "tableus",
    version: "0.3.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    runtimeVersion: { policy: "appVersion" },
    updates: { enabled: false, checkAutomatically: "NEVER" },
    ios: {
      bundleIdentifier: "com.tableus.app",
      associatedDomains: [`applinks:${linkHost}`],
      supportsTablet: false,
      config: { usesNonExemptEncryption: false },
      // Local builds talk to an API on this machine over plain HTTP.
      infoPlist: { NSAppTransportSecurity: { NSAllowsLocalNetworking: development } },
    },
    android: {
      package: "com.tableus.app",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [{ scheme: "https", host: linkHost, pathPrefix: "/join/" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-font",
      ["expo-build-properties", { android: { usesCleartextTraffic: development } }],
      "@sentry/react-native/expo",
      "./plugins/with-ios-scene-lifecycle.cjs",
    ],
    experiments: { reactCompiler: true },
    extra: { eas: { projectId: PUBLIC_RUNTIME_POLICY.easProjectId } },
  };
};
