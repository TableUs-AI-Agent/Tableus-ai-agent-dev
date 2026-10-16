import { mailto, PUBLIC_CONTACTS, PUBLIC_POLICY_LINKS } from "@tableus/domain";

import { LegalPage } from "../components/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="October 15, 2026">
      <p>TableUs is a beta. Features may change, things may break, and we may pause or end the service.</p>
      <h2>Using TableUs</h2>
      <p>You need to be at least 13. Keep plan links among the people you mean to invite, and don&apos;t misuse the service, scrape it, or try to see plans you weren&apos;t invited to.</p>
      <h2>Suggestions are suggestions</h2>
      <p>Picks and their reasons come from Google Maps data and AI, and can be wrong or out of date. We can&apos;t guarantee allergens, ingredients, hours, prices, accessibility or reservations. Check anything important with the restaurant. Map data is subject to the <a href={PUBLIC_POLICY_LINKS.googleMapsPlatformTerms} target="_blank" rel="noreferrer">Google Maps Platform terms</a>.</p>
      <h2>Your content</h2>
      <p>What you write stays yours. You let us use it to run TableUs as described on the privacy page.</p>
      <h2>Contact</h2>
      <p>Questions go to <a href={mailto(PUBLIC_CONTACTS.supportEmail)}>{PUBLIC_CONTACTS.supportEmail}</a>.</p>
    </LegalPage>
  );
}
