import type { NextConfig } from "next";
import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";
import { HOSTED_ENVIRONMENTS, hostedEnvironment, requireExactHttpsOrigin } from "@tableus/domain";
import { webApiOrigin } from "./app/lib/runtime-config";
import { FRAME_PROTECTION_HEADERS, FRAME_PROTECTION_SOURCE, PRIVATE_JOIN_HEADERS, PRIVATE_JOIN_SOURCE } from "./app/lib/security-headers";

// Hosted builds name their environment and must use exactly its origins, so a
// staging build can never point at production data or the reverse.
if (process.env.VERCEL === "1") {
  const deployEnv = hostedEnvironment(process.env.TABLEUS_DEPLOY_ENV);
  const expected = HOSTED_ENVIRONMENTS[deployEnv];
  requireExactHttpsOrigin(process.env.NEXT_PUBLIC_API_URL ?? "", expected.apiOrigin, "Vercel web API origin");
  requireExactHttpsOrigin(process.env.TABLEUS_API_ORIGIN ?? "", expected.apiOrigin, "Vercel server API origin");
  requireExactHttpsOrigin(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    expected.supabaseOrigin,
    "Vercel Supabase origin",
  );
  if ((process.env.NEXT_PUBLIC_LINK_ORIGIN ?? "") !== `https://${expected.linkHost}`) {
    throw new Error(`Vercel link origin does not match the ${deployEnv} TableUs host`);
  }
  for (const name of ["TABLEUS_TELEMETRY_MODE", "NEXT_PUBLIC_TELEMETRY_MODE"]) {
    const mode = process.env[name];
    if (mode && mode !== deployEnv) throw new Error(`${name} must be ${deployEnv} on this deploy`);
  }
}

const nextConfig: NextConfig = {
  transpilePackages: ["@tableus/domain", "@tableus/api-client"],
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "maps.googleapis.com" },
    ],
  },
  async headers() {
    return [
      {
        source: FRAME_PROTECTION_SOURCE,
        headers: [...FRAME_PROTECTION_HEADERS],
      },
      {
        source: PRIVATE_JOIN_SOURCE,
        headers: [...FRAME_PROTECTION_HEADERS, ...PRIVATE_JOIN_HEADERS],
      },
    ];
  },
  async rewrites() {
    const configuredOrigin = process.env.TABLEUS_API_ORIGIN;
    const origin = configuredOrigin
      ? webApiOrigin(configuredOrigin)
      : "";
    const rules = [
      {
        source: "/.well-known/apple-app-site-association",
        destination: "/api/site-association/apple",
      },
      {
        source: "/.well-known/assetlinks.json",
        destination: "/api/site-association/android",
      },
    ];
    if (!origin) return rules;
    return [
      ...rules,
      {
        source: "/api/v1/:path*",
        destination: `${origin.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

const sentryBuildEnabled = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

export default sentryBuildEnabled
  ? withSentryConfig(nextConfig, {
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      release: { name: process.env.TABLEUS_BUILD_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA },
      sourcemaps: { deleteSourcemapsAfterUpload: true },
      telemetry: false,
      silent: true,
    })
  : nextConfig;
