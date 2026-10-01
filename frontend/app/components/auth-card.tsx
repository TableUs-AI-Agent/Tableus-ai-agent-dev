"use client";

import { ApiError } from "@tableus/api-client";
import type { AuthLinkMode } from "@tableus/domain";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useUser } from "../context/user-context";
import { completeWebAuth, confirmedSubject } from "../lib/auth-completion";
import { isSupabaseConfigured, supabase } from "../lib/supabase-browser";
import { captureTelemetry } from "../lib/telemetry";
import { v1Api } from "../lib/v1-api";

type AuthCardProps = {
  initialMode?: AuthLinkMode;
  onApproved?: () => void | Promise<void>;
};

export function AuthCard({ initialMode = "join", onApproved }: AuthCardProps) {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [mode, setMode] = useState<AuthLinkMode>(initialMode);
  const [invite, setInvite] = useState(isSupabaseConfigured ? "" : "tableus-beta");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [redemption, setRedemption] = useState("");
  const [verifiedSubject, setVerifiedSubject] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function finish() {
    if (onApproved) await onApproved();
    else router.replace("/plans");
  }

  async function complete(subject: string, normalizedEmail: string, grant = redemption) {
    await completeWebAuth(v1Api, { mode, subject, email: normalizedEmail, invite, name, redemption: grant });
    await refreshUser(subject);
    captureTelemetry("auth_approved", { mode: mode === "join" ? "signup" : "sign_in" });
    await finish();
  }

  async function begin() {
    setBusy(true);
    setError("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (isSupabaseConfigured) {
        const existing = await confirmedSubject(() => supabase.auth.getUser(), normalizedEmail);
        if (existing) {
          setSentEmail(normalizedEmail);
          setSent(true);
          setVerifiedSubject(existing);
          await complete(existing, normalizedEmail, "");
          return;
        }
      }
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithOtp({ email: normalizedEmail, options: { shouldCreateUser: false } });
        if (signInError) throw signInError;
        setSentEmail(normalizedEmail);
        setSent(true);
        return;
      }
      const result = await v1Api.post<{ redemption_token: string }>("/api/v1/access/validate", {
        code: invite,
        email: isSupabaseConfigured ? normalizedEmail : undefined,
      });
      setRedemption(result.redemption_token);
      if (!isSupabaseConfigured) {
        await v1Api.post("/api/v1/access/redeem", { redemption_token: result.redemption_token, display_name: name });
        await finish();
      } else {
        const { error: signInError } = await supabase.auth.signInWithOtp({ email: normalizedEmail, options: { shouldCreateUser: true } });
        if (signInError) throw signInError;
        setSentEmail(normalizedEmail);
        setSent(true);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not validate the invite.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError("");
    try {
      let subject = await confirmedSubject(() => supabase.auth.getUser(), sentEmail, verifiedSubject ?? undefined);
      if (!subject) {
        if (verifiedSubject) {
          setVerifiedSubject(null);
          throw new Error("Your session ended. Request a new code to continue.");
        }
        const { error: verifyError } = await supabase.auth.verifyOtp({ email: sentEmail, token: otp.trim(), type: "email" });
        if (verifyError) throw verifyError;
        subject = await confirmedSubject(() => supabase.auth.getUser(), sentEmail);
      }
      if (!subject) throw new Error("Unable to confirm your session. Please try again.");
      setVerifiedSubject(subject);
      setOtp("");
      await complete(subject, sentEmail);
    } catch (caught) {
      if (mode === "sign-in" && caught instanceof ApiError && caught.status === 403) {
        await supabase.auth.signOut({ scope: "local" });
        setVerifiedSubject(null);
        setError("This email has not joined the TableUs beta yet. Join with an invite first.");
      } else {
        setError(caught instanceof Error ? caught.message : "Could not verify the code.");
      }
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode: AuthLinkMode) {
    setMode(nextMode);
    setOtp("");
    setSentEmail("");
    setRedemption("");
    setVerifiedSubject(null);
    setSent(false);
    setError("");
  }

  async function startOver() {
    setBusy(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (signOutError) throw signOutError;
      changeMode(mode);
    } catch {
      setError("Could not sign out of this browser. Reconnect and try again.");
    } finally {
      setBusy(false);
    }
  }

  const needsJoinFields = mode === "join";
  const disabled = busy
    || (!email && isSupabaseConfigured)
    || (needsJoinFields && (!invite || !name))
    || (sent && !verifiedSubject && !otp.trim());

  return (
    <section className="glass w-full space-y-5 rounded-[2rem] p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Closed beta</p>
        <h1 className="mt-2 text-4xl font-bold">{needsJoinFields ? "Join TableUs" : "Welcome back"}</h1>
        <p className="mt-3 text-[var(--muted-foreground)]">{needsJoinFields ? "Your invite is validated before an authentication email is sent." : "Sign in with the email for your invite-approved TableUs account."}</p>
      </div>
      {needsJoinFields ? <input aria-label="Invite code" className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="Invite code" disabled={sent || busy} /> : null}
      {needsJoinFields ? <input aria-label="Display name" className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={name} onChange={(event) => setName(event.target.value)} placeholder="Display name" autoComplete="name" disabled={sent || busy} /> : null}
      {isSupabaseConfigured ? <input aria-label="Email address" className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" autoComplete="email" disabled={sent || busy} /> : null}
      {sent && isSupabaseConfigured && !verifiedSubject ? <><p className="text-sm text-[var(--muted-foreground)]">Enter the complete code from the newest email. Code length can vary.</p><input aria-label="Email verification code" className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Email code" inputMode="numeric" autoComplete="one-time-code" /></> : null}
      {verifiedSubject ? <p role="status" className="text-sm text-[var(--muted-foreground)]">Your email is verified. Retry to finish connecting to TableUs; you do not need another code.</p> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <button disabled={disabled} onClick={sent && isSupabaseConfigured ? verify : begin} className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 font-semibold text-white disabled:opacity-50">{busy ? "Working…" : verifiedSubject ? "Retry and continue" : sent && isSupabaseConfigured ? "Verify and continue" : isSupabaseConfigured ? "Continue" : "Continue in demo mode"}</button>
      {(sent || error) && isSupabaseConfigured ? <button type="button" disabled={busy} onClick={startOver} className="w-full text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline">Sign out and start over</button> : null}
      {isSupabaseConfigured ? <button type="button" disabled={busy} onClick={() => changeMode(needsJoinFields ? "sign-in" : "join")} className="w-full text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline">{needsJoinFields ? "Already joined? Sign in" : "Have a new invite? Join the beta"}</button> : null}
      <a href="/account-deletion" className="block text-center text-sm font-semibold text-[var(--accent)] underline">Request account deletion without signing in</a>
    </section>
  );
}
