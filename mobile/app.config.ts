import type { ExpoConfig, ConfigContext } from "expo/config";
import { PUBLIC_RUNTIME_POLICY, requireExactHttpsOrigin } from "@tableus/domain";

export default ({ config }: ConfigContext): ExpoConfig => {
  const profile = process.env.EAS_BUILD_PROFILE ?? "";
  const configuredProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  if (configuredProjectId && configuredProjectId !== PUBLIC_RUNTIME_POLICY.easProjectId) {
    throw new Error("Hosted Expo project ID does not match the source-controlled TableUs project");
  }
  const projectId = PUBLIC_RUNTIME_POLICY.easProjectId;
  const linkHost = process.env.EXPO_PUBLIC_LINK_HOST ?? "links.table-us.com";
  const testBuildProfile = process.env.EAS_BUILD_PROFILE === "test-ios" || process.env.EAS_BUILD_PROFILE === "test-android";
  const authTestProfile = process.env.EAS_BUILD_PROFILE === "auth-test-ios" || process.env.EAS_BUILD_PROFILE === "auth-test-android";
  const telemetryTestProfile = process.env.EAS_BUILD_PROFILE === "telemetry-test-ios" || process.env.EAS_BUILD_PROFILE === "telemetry-test-android";
  const readinessProfile = process.env.EAS_BUILD_PROFILE === "readiness-ios" || process.env.EAS_BUILD_PROFILE === "readiness-android";
  const localE2E = testBuildProfile && process.env.TABLEUS_LOCAL_E2E === "true";
  const allowsLocalNetworking = localE2E || process.env.EAS_BUILD_PROFILE === "development";
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
  const sourceSha = process.env.EAS_BUILD_GIT_COMMIT_HASH ?? process.env.EXPO_PUBLIC_SOURCE_SHA;
  const hostedStagingProfiles = new Set([
    "preview",
    "auth-test-ios",
    "auth-test-android",
    "links-test-ios",
    "links-test-android",
    "telemetry-test-ios",
    "telemetry-test-android",
    "readiness-ios",
    "readiness-android",
  ]);
  if (profile === "production") {
    throw new Error(
      "Production mobile builds are disabled until production origins and signed OTA policy are committed in source",
    );
  }
  if (hostedStagingProfiles.has(profile)) {
    requireExactHttpsOrigin(
      apiUrl,
      PUBLIC_RUNTIME_POLICY.stagingApiOrigin,
      "Hosted mobile API origin",
    );
    requireExactHttpsOrigin(
      supabaseUrl,
      PUBLIC_RUNTIME_POLICY.stagingSupabaseOrigin,
      "Hosted mobile Supabase origin",
    );
    if (linkHost !== PUBLIC_RUNTIME_POLICY.linkHost) {
      throw new Error("Hosted mobile link host does not match the source-controlled host");
    }
    if (!sourceSha || !/^[0-9a-f]{40}$/.test(sourceSha)) {
      throw new Error("Hosted mobile builds require an exact 40-character source SHA");
    }
    if (process.env.EXPO_PUBLIC_DEMO_MODE === "true" || localE2E) {
      throw new Error("Hosted mobile builds cannot enable demo or local-E2E controls");
    }
  }
  const authE2E = authTestProfile
    && process.env.TABLEUS_AUTH_E2E === "true"
    && apiUrl.startsWith("https://")
    && process.env.EXPO_PUBLIC_DEMO_MODE !== "true";
  const telemetryE2E = telemetryTestProfile
    && process.env.TABLEUS_TELEMETRY_E2E === "true"
    && process.env.EXPO_PUBLIC_TELEMETRY_MODE === "staging"
    && apiUrl.startsWith("https://")
    && process.env.EXPO_PUBLIC_DEMO_MODE !== "true";
  const readiness = readinessProfile
    && process.env.TABLEUS_READINESS === "true"
    && apiUrl.startsWith("https://")
    && process.env.EXPO_PUBLIC_DEMO_MODE !== "true"
    && process.env.EXPO_PUBLIC_TELEMETRY_MODE === "staging"
    && !localE2E
    && !authE2E
    && !telemetryE2E;
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
    updates: { enabled: false, checkAutomatically: "NEVER" },
    ios: {
      bundleIdentifier: "com.tableus.app",
      associatedDomains: [`applinks:${linkHost}`],
      supportsTablet: true,
      config: { usesNonExemptEncryption: false },
      infoPlist: {
        NSAppTransportSecurity: { NSAllowsLocalNetworking: allowsLocalNetworking },
      },
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
      "expo-sharing",
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
    extra: {
      apiUrl,
      supabaseUrl,
      linkHost,
      localE2E,
      authE2E,
      telemetryE2E,
      readiness,
      telemetryMode: process.env.EXPO_PUBLIC_TELEMETRY_MODE ?? "off",
      demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === "true",
      sourceSha,
      eas: { projectId },
    },
  };
};
