import Link from "next/link";
import { ACCOUNT_DELETION_HELP, mailto, PUBLIC_CONTACTS } from "@tableus/domain";

export default function AccountDeletionPage() {
  return <article className="prose mx-auto max-w-3xl px-6 py-16">
    <h1>Request account deletion</h1>
    <p>You can request deletion even if you cannot sign in or no longer have the app.</p>
    <h2>Request by email</h2>
    <p>{ACCOUNT_DELETION_HELP.request}</p>
    <p><a href={mailto(PUBLIC_CONTACTS.privacyEmail)}>Email {PUBLIC_CONTACTS.privacyEmail}</a></p>
    <p>If an email app does not open, copy this address: <strong>{PUBLIC_CONTACTS.privacyEmail}</strong></p>
    <p>{ACCOUNT_DELETION_HELP.acknowledgment}</p>
    <h2>Request in the app</h2>
    <p>{ACCOUNT_DELETION_HELP.inApp} <Link href="/account">Open Account and data</Link>.</p>
    <h2>What happens to shared content</h2>
    <p>{ACCOUNT_DELETION_HELP.shared}</p>
    <h2>Request status and retained records</h2>
    <p>{ACCOUNT_DELETION_HELP.pending}</p>
    <p>{ACCOUNT_DELETION_HELP.limits}</p>
    <p><Link href="/privacy">Read the privacy notice</Link></p>
  </article>;
}
