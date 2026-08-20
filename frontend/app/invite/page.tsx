"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { isSupabaseConfigured, supabase } from "../lib/supabase-browser";
import { v1Api } from "../lib/v1-api";

export default function InvitePage() {
  const router = useRouter();
  const [invite, setInvite] = useState(isSupabaseConfigured ? "" : "tableus-beta");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [redemption, setRedemption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function begin() {
    setBusy(true);
    setError("");
    try {
      const result = await v1Api.post<{ redemption_token: string }>("/api/v1/access/validate", {
        code: invite,
        email: isSupabaseConfigured ? email : undefined,
      });
      setRedemption(result.redemption_token);
      if (!isSupabaseConfigured) {
        await v1Api.post("/api/v1/access/redeem", { redemption_token: result.redemption_token, display_name: name });
        router.push("/plans");
      } else {
        const { error: signInError } = await supabase.auth.signInWithOtp({ email });
        if (signInError) throw signInError;
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
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
      if (verifyError) throw verifyError;
      await v1Api.post("/api/v1/access/redeem", { redemption_token: redemption, display_name: name });
      router.push("/plans");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-xl items-center px-6 py-16">
      <section className="glass w-full space-y-5 rounded-[2rem] p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Closed beta</p>
          <h1 className="mt-2 text-4xl font-bold">Join TableUs</h1>
          <p className="mt-3 text-[var(--muted-foreground)]">Your invite is validated before an authentication email is sent.</p>
        </div>
        <input className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="Invite code" />
        <input className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={name} onChange={(event) => setName(event.target.value)} placeholder="Display name" />
        {isSupabaseConfigured ? <input className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" /> : null}
        {redemption && isSupabaseConfigured ? <input className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Email code" inputMode="numeric" /> : null}
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        <button disabled={busy || !invite || !name || (isSupabaseConfigured && !email)} onClick={redemption && isSupabaseConfigured ? verify : begin} className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 font-semibold text-white disabled:opacity-50">
          {busy ? "Working…" : redemption && isSupabaseConfigured ? "Verify and continue" : isSupabaseConfigured ? "Email me a code" : "Continue in demo mode"}
        </button>
      </section>
    </div>
  );
}
