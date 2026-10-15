"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AppShell } from "../components/app-shell";
import { TasteField } from "../components/taste-field";
import { api, errorMessage } from "../lib/api";
import { useMe, useSession } from "../lib/session";

export default function AccountPage() {
  return <AppShell><Account /></AppShell>;
}

function Account() {
  const me = useMe();
  const { signOut } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState(me.data?.display_name ?? "");
  const [taste, setTaste] = useState(me.data?.taste_profile ?? "");
  const [confirm, setConfirm] = useState("");

  const save = useMutation({
    mutationFn: () => api.saveMe({ display_name: name.trim(), taste_profile: taste }),
    onSuccess: (saved) => queryClient.setQueryData(["me", saved.id], saved),
  });
  const remove = useMutation({
    mutationFn: api.deleteAccount,
    onSuccess: async () => { await signOut(); router.replace("/"); },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <>
      <h1 className="display mt-4 text-6xl">Your account</h1>
      <form onSubmit={submit} className="mt-8 space-y-6">
        <label className="block">
          <span className="mb-1 block font-semibold">Your name</span>
          <input className="field" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <TasteField value={taste} onChange={setTaste} />
        {save.isError ? <p role="alert" className="text-radicchio">{errorMessage(save.error)}</p> : null}
        <button className="btn btn-primary" disabled={save.isPending || !name.trim()}>
          {save.isPending ? "Saving…" : save.isSuccess ? "Saved" : "Save changes"}
        </button>
      </form>

      <section className="mt-12 border-t-2 border-sage pt-8">
        <button type="button" className="btn btn-quiet" onClick={async () => { await signOut(); router.replace("/"); }}>Sign out</button>
      </section>

      <section aria-labelledby="delete" className="mt-12 border-t-2 border-sage pt-8">
        <h2 id="delete" className="text-xl font-bold">Delete your account</h2>
        <p className="mt-2 max-w-prose">
          This removes your profile, your wishes and your votes, and signs you out everywhere. Plans
          you started with other people move to the next person who joined. Plans with only you are deleted.
        </p>
        <label className="mt-4 block max-w-xs">
          <span className="mb-1 block font-semibold">Type DELETE to confirm</span>
          <input className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
        </label>
        {remove.isError ? <p role="alert" className="mt-3 text-radicchio">{errorMessage(remove.error)}</p> : null}
        <button
          type="button"
          className="btn mt-4 border-2 border-radicchio text-radicchio"
          disabled={confirm !== "DELETE" || remove.isPending}
          onClick={() => remove.mutate()}
        >
          {remove.isPending ? "Deleting…" : "Delete my account"}
        </button>
        <p className="mt-6 text-sm text-moss">
          <Link href="/privacy" className="underline underline-offset-4">Privacy</Link>{" "}and{" "}
          <Link href="/terms" className="underline underline-offset-4">terms</Link>
        </p>
      </section>
    </>
  );
}
