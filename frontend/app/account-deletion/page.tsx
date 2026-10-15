import { mailto, PUBLIC_CONTACTS } from "@tableus/domain";
import Link from "next/link";

import { LegalPage } from "../components/legal-page";

export default function AccountDeletionPage() {
  return (
    <LegalPage title="Delete your account" updated="October 15, 2026">
      <p>The fastest way is in the app: sign in, open <Link href="/account">your account</Link>, and choose Delete my account. It takes effect right away.</p>
      <h2>If you can&apos;t sign in</h2>
      <p>Email <a href={mailto(PUBLIC_CONTACTS.privacyEmail)}>{PUBLIC_CONTACTS.privacyEmail}</a> from the address you use with TableUs and ask us to delete your account. Don&apos;t include sign-in codes or plan links. We&apos;ll reply within two business days.</p>
      <h2>What gets deleted</h2>
      <p>Your profile, standing tastes, wishes, votes and sign-in. Plans you started with other people move to the next person who joined; plans with only you are deleted.</p>
    </LegalPage>
  );
}
