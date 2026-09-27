import Link from "next/link";
import { ACCOUNT_DELETION_HELP, mailto, PUBLIC_CONTACTS } from "@tableus/domain";

const text = "text-base leading-7 text-[var(--muted-foreground)]";
const heading = "text-xl font-semibold text-[var(--foreground)]";
const inlineLink = "font-semibold text-[var(--foreground)] underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]";

export default function AccountDeletionPage() {
  return <article className="mx-auto max-w-3xl space-y-10 px-6 py-12 sm:py-16">
    <header className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)]">Account and privacy</p>
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">Request account deletion</h1>
      <p className={text}>You can request deletion even if you cannot sign in or no longer have the app.</p>
    </header>
    <section aria-labelledby="request-by-email" className="space-y-4 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
      <h2 id="request-by-email" className={heading}>Request by email</h2>
      <p className={text}>{ACCOUNT_DELETION_HELP.request}</p>
      <a className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href={mailto(PUBLIC_CONTACTS.privacyEmail)}>Email {PUBLIC_CONTACTS.privacyEmail}</a>
      <p className={text}>If an email app does not open, copy this address: <strong className="select-all break-all font-semibold text-[var(--foreground)]">{PUBLIC_CONTACTS.privacyEmail}</strong></p>
      <p className={text}>{ACCOUNT_DELETION_HELP.acknowledgment}</p>
    </section>
    <section aria-labelledby="request-in-app" className="space-y-4">
      <h2 id="request-in-app" className={heading}>Request in the app</h2>
      <p className={text}>{ACCOUNT_DELETION_HELP.inApp} <Link href="/account" className={inlineLink}>Open Account and data</Link>.</p>
    </section>
    <section aria-labelledby="shared-content" className="space-y-4">
      <h2 id="shared-content" className={heading}>What happens to shared content</h2>
      <p className={text}>{ACCOUNT_DELETION_HELP.shared}</p>
    </section>
    <section aria-labelledby="request-status" className="space-y-4">
      <h2 id="request-status" className={heading}>Request status and retained records</h2>
      <p className={text}>{ACCOUNT_DELETION_HELP.pending}</p>
      <p className={text}>{ACCOUNT_DELETION_HELP.limits}</p>
      <p><Link href="/privacy" className={inlineLink}>Read the privacy notice</Link></p>
    </section>
  </article>;
}
