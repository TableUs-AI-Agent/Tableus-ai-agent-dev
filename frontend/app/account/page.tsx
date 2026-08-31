"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, Loader2, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase-browser";
import { v1Api } from "../lib/v1-api";
import { clearPrivateQueryState } from "../lib/session-query-isolation";
import { useUser } from "../context/user-context";

type Profile = {
  id: string;
  display_name: string;
  share_taste: boolean;
};

type AccountControl = {
  can_delete: boolean;
  blockers: Array<"organized_plans">;
  organized_plan_count: number;
  deletion_scope: "application_profile";
  supabase_auth_removal: "operator_required";
};

const DELETE_CONFIRMATION = "DELETE";

export default function AccountPage() {
  const { currentUser } = useUser();
  if (!currentUser) {
    return (
      <main className="flex min-h-full items-center justify-center" aria-label="Loading account settings">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--accent)]" />
      </main>
    );
  }
  return <AccountPageContent key={currentUser.id} />;
}

function AccountPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [control, setControl] = useState<AccountControl | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      v1Api.get<Profile>("/api/v1/me"),
      v1Api.get<AccountControl>("/api/v1/me/account-control"),
    ])
      .then(([profileResult, controlResult]) => {
        if (active) {
          setProfile(profileResult);
          setControl(controlResult);
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load account settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const downloadExport = async () => {
    setExporting(true);
    setError("");
    setMessage("");
    try {
      const data = await v1Api.get<unknown>("/api/v1/me/export");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `tableus-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage("Your TableUs application data export was downloaded.");
    } catch (exportError: unknown) {
      setError(exportError instanceof Error ? exportError.message : "Unable to export your data.");
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    if (confirmation !== DELETE_CONFIRMATION) return;
    setDeleting(true);
    setError("");
    setMessage("");
    try {
      await v1Api.delete<{ deleted: boolean }>("/api/v1/me", { confirmation: DELETE_CONFIRMATION });
      clearPrivateQueryState(queryClient);
      await supabase.auth.signOut();
      router.replace("/invite");
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete your application data.");
      setDeleting(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    setError("");
    clearPrivateQueryState(queryClient);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("Unable to sign out. Please retry.");
      setSigningOut(false);
      return;
    }
    router.replace("/invite");
  };

  if (loading) {
    return (
      <main className="flex min-h-full items-center justify-center" aria-label="Loading account settings">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--accent)]" />
      </main>
    );
  }

  return (
    <main className="min-h-full px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="glass rounded-[36px] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-[var(--accent)]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Account and privacy
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-[var(--foreground)]">
                {profile?.display_name ?? "Your account"}
              </h1>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-[var(--muted-foreground)]">
            Taste-profile sharing is currently <strong>{profile?.share_taste ? "on" : "off"}</strong>.
            Change it from your profile controls. Review the{" "}
            <Link className="font-semibold text-[var(--accent)]" href="/privacy">privacy notice</Link>
            {" "}or <Link className="font-semibold text-[var(--accent)]" href="/terms">beta terms</Link>.
          </p>
        </section>

        <section className="glass rounded-[36px] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Session</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Sign out of TableUs on this browser and clear private in-memory data.
          </p>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </section>

        <section className="glass rounded-[36px] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Export my data</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Download a JSON copy of your TableUs profile, reviews, and participating plan identifiers.
          </p>
          <button
            type="button"
            onClick={downloadExport}
            disabled={exporting}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? "Preparing export…" : "Download my data"}
          </button>
        </section>

        <section className="rounded-[36px] border border-red-200 bg-red-50/80 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-red-800">
            <Trash2 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Delete application data</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-red-800/80">
            This permanently removes your TableUs application profile. Organized plans must be transferred or removed first.
            Supabase authentication records may require separate operator removal during the closed beta.
          </p>
          <p role="status" className="mt-3 text-sm font-semibold text-red-900">
            {control?.can_delete
              ? "Application profile deletion is available. Supabase Auth removal remains operator-assisted."
              : `${control?.organized_plan_count ?? 0} organized plan${control?.organized_plan_count === 1 ? "" : "s"} must be transferred or removed first.`}
          </p>
          <label className="mt-5 block text-sm font-semibold text-red-900" htmlFor="delete-confirmation">
            Type DELETE to confirm
          </label>
          <input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            className="mt-2 min-h-11 w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-[var(--foreground)] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
          />
          <button
            type="button"
            onClick={deleteAccount}
            disabled={confirmation !== DELETE_CONFIRMATION || deleting || !control?.can_delete}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? "Deleting…" : "Delete my application data"}
          </button>
        </section>

        {message ? <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
        {error ? <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
      </div>
    </main>
  );
}
