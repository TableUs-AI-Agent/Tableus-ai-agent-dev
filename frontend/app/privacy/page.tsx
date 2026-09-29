import { ACCOUNT_DELETION_HELP, BETA_NOTICE_EFFECTIVE_DATE, mailto, PUBLIC_CONTACTS, PUBLIC_POLICY_LINKS } from "@tableus/domain";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>TableUs closed-beta privacy notice</h1>
      <p><strong>Effective {BETA_NOTICE_EFFECTIVE_DATE}.</strong> This notice describes the limited US closed beta.</p>
      <h2>Data we process</h2>
      <p>We process account identifiers, a one-way email hash in the application database, display name, invite redemption, connections, reviews, optional taste preferences, plans, constraints, votes, audit events, and provider-usage totals needed to operate and protect TableUs. Supabase separately processes authentication email and session data.</p>
      <h2>Photos, location, restaurant data, and AI</h2>
      <p>Food photos are validated, resized, stripped of metadata, sent ephemerally to Google Gemini for analysis, and not stored by TableUs. Recommendation requests and group constraints, and review content used to create an optional taste summary, may also be sent to Google Gemini. Location queries are sent to Google Maps to resolve a place and find restaurants, but are not sent to telemetry. Google display data is refreshed rather than retained; TableUs stores Google Place IDs, the location label you entered, and its own planning metadata. Your entered plan location label is visible to plan participants. Google processes data under the <a href={PUBLIC_POLICY_LINKS.googlePrivacyPolicy} target="_blank" rel="noreferrer">Google Privacy Policy</a>.</p>
      <h2>Analytics and error reporting</h2>
      <p>During the beta, TableUs sends a small default-on set of anonymous aggregate product events to PostHog using a random in-memory session identifier that resets when the page or app process ends. We do not create analytics person profiles, persist an analytics identifier, use autocapture, collect location through analytics, or record sessions. Unexpected application errors may be sent to Sentry with messages, request bodies, headers, user fields, breadcrumbs, query strings, and private URL segments removed; performance traces, profiling, replay, and attachments are disabled. Raw emails, reviews, queries, precise locations, photos, prompts, provider responses, and complete share tokens are excluded.</p>
      <h2>Sharing and retention</h2>
      <p>Plan content is visible only to approved participants. Taste-profile sharing is opt-in. Service providers receive only the information required to provide authentication, hosting, database, maps, AI, analytics, and error-reporting services. Account data is retained while your account is active.</p>
      <p>{ACCOUNT_DELETION_HELP.limits}</p>
      <h2>Your choices</h2>
      <p>{ACCOUNT_DELETION_HELP.inApp}</p>
      <p>{ACCOUNT_DELETION_HELP.shared}</p>
      <p>{ACCOUNT_DELETION_HELP.pending}</p>
      <p>{ACCOUNT_DELETION_HELP.accessLoss}</p>
      <p><Link href="/account-deletion">How to request account deletion without signing in</Link></p>
      <h2>Safety and contact</h2>
      <p>TableUs is not intended for children under 13. Do not submit sensitive medical information. Questions and deletion problems can be sent to <a href={mailto(PUBLIC_CONTACTS.privacyEmail)}>{PUBLIC_CONTACTS.privacyEmail}</a>.</p>
    </article>
  );
}
