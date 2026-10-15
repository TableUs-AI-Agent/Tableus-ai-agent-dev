import { mailto, PUBLIC_CONTACTS, PUBLIC_POLICY_LINKS } from "@tableus/domain";
import Link from "next/link";

import { LegalPage } from "../components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="October 15, 2026">
      <p>TableUs is in an early beta with a small group of people. This page explains what we keep and why, in plain terms.</p>
      <h2>What we keep</h2>
      <p>Your email address, used only to sign you in (handled by Supabase). Your name, and the standing tastes you choose to save. The plans you start or join, the wishes you add to them, and your votes.</p>
      <h2>Who sees what</h2>
      <p>People in a plan see each other&apos;s names, wishes and whether they&apos;ve voted. Your standing tastes are private to you; we use them only to make suggestions.</p>
      <h2>Services we use</h2>
      <p>To find restaurants, we send the location you type and the group&apos;s request to Google Maps. To pick places that fit the group, we send everyone&apos;s wishes and standing tastes, without names or email addresses, to Google Gemini along with details of nearby places. Google handles that data under its <a href={PUBLIC_POLICY_LINKS.googlePrivacyPolicy} target="_blank" rel="noreferrer">privacy policy</a>. We store Google Place IDs, not Google&apos;s restaurant details. If something breaks, an error report without your personal details goes to Sentry.</p>
      <p>We don&apos;t sell data, show ads or use analytics trackers.</p>
      <h2>Deleting your data</h2>
      <p>You can delete your account at any time from <Link href="/account">your account page</Link>. It happens right away. Plans you started with other people stay with them. If you can&apos;t sign in, see <Link href="/account-deletion">how to ask us to delete it</Link>.</p>
      <h2>Contact</h2>
      <p>Questions go to <a href={mailto(PUBLIC_CONTACTS.privacyEmail)}>{PUBLIC_CONTACTS.privacyEmail}</a>. TableUs isn&apos;t meant for children under 13.</p>
    </LegalPage>
  );
}
