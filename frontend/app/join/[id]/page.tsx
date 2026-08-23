"use client";

import type { Plan } from "@tableus/domain";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { v1Api } from "../../lib/v1-api";

export default function JoinPage() {
  const { id } = useParams<{ id: string }>();
  const token = useSearchParams().get("token");
  const router = useRouter();
  const join = useMutation({
    mutationFn: () => v1Api.post<Plan>(`/api/v1/plans/${id}/join`, { share_token: token }),
    onSuccess: () => router.replace(`/plans/${id}`),
  });
  return (
    <div className="mx-auto flex min-h-full max-w-xl items-center px-6 py-16">
      <section className="glass w-full space-y-5 rounded-[2rem] p-8">
        <h1 className="text-4xl font-bold">Join this dinner plan?</h1>
        <p className="text-[var(--muted-foreground)]">Only authenticated, invite-approved diners with the current private link can join.</p>
        {join.error ? <p role="alert" className="text-red-700">{join.error.message} <Link href="/invite" className="underline">Sign in with an invite</Link>.</p> : null}
        <button disabled={!token || join.isPending} onClick={() => join.mutate()} className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 font-semibold text-white disabled:opacity-50">{join.isPending ? "Joining…" : "Join plan"}</button>
      </section>
    </div>
  );
}
