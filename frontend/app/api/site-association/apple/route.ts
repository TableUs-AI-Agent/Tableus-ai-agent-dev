import { buildAppleAssociation } from "../../../lib/site-association";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    const payload = buildAppleAssociation(
      process.env.APPLE_TEAM_ID ?? "",
      process.env.IOS_BUNDLE_IDENTIFIER ?? "com.tableus.app",
    );
    return Response.json(payload, {
      headers: { "Cache-Control": "public, max-age=300", "Content-Type": "application/json" },
    });
  } catch {
    return Response.json(
      { error: "Apple association identifiers are not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
