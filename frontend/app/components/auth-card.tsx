"use client";

import { ApiError } from "@tableus/api-client";
import type { AuthLinkMode } from "@tableus/domain";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isSupabaseConfigured, supabase } from "../lib/supabase-browser";
import { captureTelemetry } from "../lib/telemetry";
import { v1Api } from "../lib/v1-api";

type AuthCardProps = {
  initialMode?: AuthLinkMode;
  onApproved?: () => void | Promise<void>;
};

export function AuthCard({ initialMode = "join", onApproved }: AuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthLinkMode>(initialMode);
  const [invite, setInvite] = useState(isSupabaseConfigured ? "" : "tableus-beta");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [redemption, setRedemption] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function finish() {
    if (onApproved) await onApproved();
    else router.replace("/plans");
  }

  async function begin() {
    setBusy(true);
    setError("");
    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
        if (signInError) throw signInError;
        setSent(true);
        return;
      }
      const result = await v1Api.post<{ redemption_token: string }>("/api/v1/access/validate", {
        code: invite,
        email: isSupabaseConfigured ? email : undefined,
      });
      setRedemption(result.redemption_token);
      if (!isSupabaseConfigured) {
        await v1Api.post("/api/v1/access/redeem", { redemption_token: result.redemption_token, display_name: name });
        await finish();
      } else {
        const { error: signInError } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
        if (signInError) throw signInError;
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
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp.trim(), type: "email" });
      if (verifyError) throw verifyError;
      if (mode === "join") {
        await v1Api.post("/api/v1/access/redeem", { redemption_token: redemption, display_name: name });
      } else {
        await v1Api.get("/api/v1/me");
      }
      captureTelemetry("auth_approved", { mode: mode === "join" ? "signup" : "sign_in" });
      await finish();
    } catch (caught) {
      if (mode === "sign-in" && caught instanceof ApiError && caught.status === 403) {
        await supabase.auth.signOut();
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
    setRedemption("");
    setSent(false);
    setError("");
  }

  const needsJoinFields = mode === "join";
  const disabled = busy
    || (!email && isSupabaseConfigured)
    || (needsJoinFields && (!invite || !name))
    || (sent && !otp.trim());

  return (
    <section className="glass w-full space-y-5 rounded-[2rem] p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Closed beta</p>
        <h1 className="mt-2 text-4xl font-bold">{needsJoinFields ? "Join TableUs" : "Welcome back"}</h1>
        <p className="mt-3 text-[var(--muted-foreground)]">{needsJoinFields ? "Your invite is validated before an authentication email is sent." : "Sign in with the email for your invite-approved TableUs account."}</p>
      </div>
      {needsJoinFields ? <input aria-label="Invite code" className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="Invite code" /> : null}
      {needsJoinFields ? <input aria-label="Display name" className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={name} onChange={(event) => setName(event.target.value)} placeholder="Display name" autoComplete="name" /> : null}
      {isSupabaseConfigured ? <input aria-label="Email address" className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" autoComplete="email" /> : null}
      {sent && isSupabaseConfigured ? <><p className="text-sm text-[var(--muted-foreground)]">Enter the complete code from the newest email. Code length can vary.</p><input aria-label="Email verification code" className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Email code" inputMode="numeric" autoComplete="one-time-code" /></> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <button disabled={disabled} onClick={sent && isSupabaseConfigured ? verify : begin} className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 font-semibold text-white disabled:opacity-50">{busy ? "Working…" : sent && isSupabaseConfigured ? "Verify and continue" : isSupabaseConfigured ? "Email me a code" : "Continue in demo mode"}</button>
      {isSupabaseConfigured ? <button type="button" onClick={() => changeMode(needsJoinFields ? "sign-in" : "join")} className="w-full text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline">{needsJoinFields ? "Already joined? Sign in" : "Have a new invite? Join the beta"}</button> : null}
    </section>
  );
}
