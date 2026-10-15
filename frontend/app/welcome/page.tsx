"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";

import { SimplePage } from "../components/simple-page";
import { TasteField } from "../components/taste-field";
import { api, errorMessage } from "../lib/api";
import { safeNext } from "../lib/next-path";
import { useMe, useSession } from "../lib/session";

export default function WelcomePage() {
  return <Suspense><Welcome /></Suspense>;
}

function Welcome() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { session } = useSession();
  const me = useMe();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [taste, setTaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session.status === "signed-out") router.replace(`/signin?next=${encodeURIComponent(next)}`);
    else if (me.data) router.replace(next);
  }, [session.status, me.data, next, router]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const saved = await api.saveMe({ display_name: name.trim(), taste_profile: taste });
      queryClient.setQueryData(["me", saved.id], saved);
      router.replace(next);
    } catch (failure) {
      setError(errorMessage(failure));
      setBusy(false);
    }
  }

  return (
    <SimplePage title="Hi there" intro="Two quick things so your friends know it's you.">
      <form onSubmit={save} className="space-y-6">
        <label className="block">
          <span className="mb-1 block font-semibold">Your name</span>
          <input className="field" autoComplete="given-name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <TasteField value={taste} onChange={setTaste} />
        {error ? <p role="alert" className="text-radicchio">{error}</p> : null}
        <button className="btn btn-primary w-full" disabled={busy || !name.trim()}>{busy ? "Saving…" : "Continue"}</button>
      </form>
    </SimplePage>
  );
}
