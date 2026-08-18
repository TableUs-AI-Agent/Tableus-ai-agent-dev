import {
  buildAndroidAssociation,
  parseAndroidFingerprints,
} from "../../../lib/site-association";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    const payload = buildAndroidAssociation(
      process.env.ANDROID_PACKAGE_NAME ?? "com.tableus.app",
      parseAndroidFingerprints(process.env.ANDROID_SHA256_CERT_FINGERPRINTS ?? ""),
    );
    return Response.json(payload, {
      headers: { "Cache-Control": "public, max-age=300", "Content-Type": "application/json" },
    });
  } catch {
    return Response.json(
      { error: "Android association identifiers are not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
