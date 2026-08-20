import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? "0601c3b9-0082-454c-b636-45a1fe377f7b";
  const linkHost = process.env.EXPO_PUBLIC_LINK_HOST ?? "tableus.app";
  const localE2E = process.env.TABLEUS_LOCAL_E2E === "true";
  return {
    ...config,
    name: "TableUs",
    slug: "tableus",
    owner: "tableus",
    scheme: "tableus",
    version: "0.2.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    runtimeVersion: { policy: "appVersion" },
    updates: projectId ? { url: `https://u.expo.dev/${projectId}` } : undefined,
    ios: {
      bundleIdentifier: "com.tableus.app",
      associatedDomains: [`applinks:${linkHost}`],
      supportsTablet: true,
      config: { usesNonExemptEncryption: false },
      ...(localE2E
        ? { infoPlist: { NSAppTransportSecurity: { NSAllowsLocalNetworking: true } } }
        : {}),
    },
    android: {
      package: "com.tableus.app",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            { scheme: "https", host: linkHost, pathPrefix: "/join" },
            { scheme: "https", host: linkHost, pathPrefix: "/auth" },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      ["expo-build-properties", { android: { usesCleartextTraffic: localE2E } }],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow TableUs to select a food photo for one-time analysis.",
          cameraPermission: false,
          microphonePermission: false,
        },
      ],
      "@sentry/react-native/expo",
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
    extra: { eas: projectId ? { projectId } : undefined },
  };
};
