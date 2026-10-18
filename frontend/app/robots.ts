import type { MetadataRoute } from "next";

// Only production is meant to show up in search; staging and previews stay out.
export default function robots(): MetadataRoute.Robots {
  if (process.env.TABLEUS_DEPLOY_ENV === "production") {
    return { rules: { userAgent: "*", allow: "/", disallow: ["/plans/", "/join/", "/account"] } };
  }
  return { rules: { userAgent: "*", disallow: "/" } };
}
