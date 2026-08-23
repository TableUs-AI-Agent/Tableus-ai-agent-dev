import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? "0601c3b9-0082-454c-b636-45a1fe377f7b";
  const linkHost = process.env.EXPO_PUBLIC_LINK_HOST ?? "links.table-us.com";
  const testBuildProfile = process.env.EAS_BUILD_PROFILE === "test-ios" || process.env.EAS_BUILD_PROFILE === "test-android";
  const authTestProfile = process.env.EAS_BUILD_PROFILE === "auth-test-ios" || process.env.EAS_BUILD_PROFILE === "auth-test-android";
  const localE2E = testBuildProfile && process.env.TABLEUS_LOCAL_E2E === "true";
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
  const sourceSha = process.env.EAS_BUILD_GIT_COMMIT_HASH ?? process.env.EXPO_PUBLIC_SOURCE_SHA;
  const authE2E = authTestProfile
    && process.env.TABLEUS_AUTH_E2E === "true"
    && apiUrl.startsWith("https://")
    && process.env.EXPO_PUBLIC_DEMO_MODE !== "true";
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
          data: [{ scheme: "https", host: linkHost, pathPrefix: "/join/" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [{ scheme: "https", host: linkHost, path: "/auth" }],
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
    extra: { localE2E, authE2E, sourceSha, eas: projectId ? { projectId } : undefined },
  };
};
