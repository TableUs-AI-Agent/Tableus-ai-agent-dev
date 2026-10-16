"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";

import { SimplePage } from "../components/simple-page";
import { DEMO_PEOPLE, setDemoUser } from "../lib/api";
import { suggestEmail } from "../lib/email-typo";
import { safeNext } from "../lib/next-path";
import { useSession } from "../lib/session";
import { isSupabaseConfigured, supabase } from "../lib/supabase-browser";

export default function SignInPage() {
  return <Suspense><SignIn /></Suspense>;
}

function SignIn() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { session, refresh } = useSession();

  useEffect(() => {
    if (session.status === "signed-in") router.replace(next);
  }, [session.status, next, router]);

  return (
    <SimplePage
      title="Sign in"
      pip="wave"
      intro={isSupabaseConfigured ? "We'll email you a sign-in code. No password needed." : undefined}
    >
      {isSupabaseConfigured ? (
        <EmailCode onSignedIn={() => router.replace(next)} />
      ) : (
        <DemoPicker onPick={(id) => { setDemoUser(id); refresh(); router.replace(next); }} />
      )}
    </SimplePage>
  );
}

function EmailCode({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  // Remembered for this tab, so a phone that reloads the page while someone is
  // in their mail app still shows the code box.
  const [sentTo, setSentToState] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setSentToState(readPendingEmail()), []);
  function setSentTo(address: string | null) {
    setSentToState(address);
    try {
      if (address) window.sessionStorage.setItem(PENDING_EMAIL, address);
      else window.sessionStorage.removeItem(PENDING_EMAIL);
    } catch {
      // Private browsing without storage: the code box just won't survive a reload.
    }
  }
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suggestion = suggestEmail(email.trim().toLowerCase());

  async function send(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const address = email.trim().toLowerCase();
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: address,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (sendError?.status === 429) setError("A code was sent a moment ago. Wait a minute, then try again.");
    else if (sendError) setError("Couldn't send a code to that address. Check it and try again.");
    else setSentTo(address);
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (!sentTo) return;
    setBusy(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.verifyOtp({ email: sentTo, token: code, type: "email" });
    setBusy(false);
    if (verifyError) setError("That code didn't work. Check the latest email, or send a new code.");
    else {
      setSentTo(null);
      onSignedIn();
    }
  }

  if (!sentTo) {
    return (
      <form onSubmit={send} className="space-y-4">
        <label className="block">
          <span className="mb-1 block font-semibold">Email</span>
          <input className="field" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {suggestion ? (
          <p>
            Did you mean{" "}
            <button type="button" className="font-semibold underline" onClick={() => setEmail(suggestion)}>{suggestion}</button>?
          </p>
        ) : null}
        {error ? <p role="alert" className="text-radicchio">{error}</p> : null}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Sending…" : "Email me a code"}</button>
      </form>
    );
  }
  return (
    <form onSubmit={verify} className="space-y-4">
      <p>We sent a code to <strong>{sentTo}</strong>. It can take a minute, and sometimes lands in spam.</p>
      <label className="block">
        <span className="mb-1 block font-semibold">Code</span>
        <input
          className="field text-2xl tracking-[0.3em]"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6,10}"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
      </label>
      {error ? <p role="alert" className="text-radicchio">{error}</p> : null}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
      <button type="button" className="btn btn-text" onClick={() => { setSentTo(null); setCode(""); }}>Use a different email</button>
    </form>
  );
}

const PENDING_EMAIL = "tableus.signin.email";

function readPendingEmail(): string | null {
  try {
    return window.sessionStorage.getItem(PENDING_EMAIL);
  } catch {
    return null;
  }
}

function DemoPicker({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-moss">Local development: pick a demo person. Use a second browser to be the other one.</p>
      {DEMO_PEOPLE.map((person) => (
        <button key={person.id} type="button" className="btn btn-quiet w-full" onClick={() => onPick(person.id)}>
          Continue as {person.name}
        </button>
      ))}
    </div>
  );
}
