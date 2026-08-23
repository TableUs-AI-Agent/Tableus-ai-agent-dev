import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
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

export default nextConfig;
