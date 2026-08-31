import type { NextConfig } from "next";
import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";
import { PUBLIC_RUNTIME_POLICY, requireExactHttpsOrigin } from "@tableus/domain";

if (process.env.VERCEL === "1") {
  requireExactHttpsOrigin(
    process.env.NEXT_PUBLIC_API_URL ?? "",
    PUBLIC_RUNTIME_POLICY.stagingApiOrigin,
    "Vercel web API origin",
  );
  requireExactHttpsOrigin(
    process.env.TABLEUS_API_ORIGIN ?? "",
    PUBLIC_RUNTIME_POLICY.stagingApiOrigin,
    "Vercel server API origin",
  );
  requireExactHttpsOrigin(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    PUBLIC_RUNTIME_POLICY.stagingSupabaseOrigin,
    "Vercel Supabase origin",
  );
  if ((process.env.NEXT_PUBLIC_LINK_ORIGIN ?? "") !== `https://${PUBLIC_RUNTIME_POLICY.linkHost}`) {
    throw new Error("Vercel link origin does not match the source-controlled TableUs host");
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
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "maps.googleapis.com" },
    ],
  },
  async rewrites() {
    const configuredOrigin = process.env.TABLEUS_API_ORIGIN;
    const origin = configuredOrigin
      ? requireExactHttpsOrigin(
          configuredOrigin,
          PUBLIC_RUNTIME_POLICY.stagingApiOrigin,
          "Web rewrite API origin",
        )
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
