import type { NextConfig } from "next";
import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";

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
    const origin = process.env.TABLEUS_API_ORIGIN;
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
