"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useMe, useSession } from "../lib/session";
import { Wordmark } from "./wordmark";

/** Signed-in screens: header plus a guard that routes people to sign-in or setup. */
export function AppShell({ children, width = "max-w-xl" }: { children: ReactNode; width?: string }) {
  const { session } = useSession();
  const me = useMe();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const next = encodeURIComponent(pathname);
    if (session.status === "signed-out") router.replace(`/signin?next=${next}`);
    else if (me.data === null) router.replace(`/welcome?next=${next}`);
  }, [session.status, me.data, pathname, router]);

  const ready = session.status === "signed-in" && me.data;
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Wordmark href="/plans" />
        {me.data ? (
          <Link href="/account" className="flex items-center gap-2 font-semibold">
            <Initials name={me.data.display_name} />
            <span className="hidden sm:inline">{me.data.display_name}</span>
          </Link>
        ) : null}
      </header>
      <main className={`mx-auto ${width} px-4 pb-24 sm:px-6`}>
        {ready ? children : me.isError ? <LoadError onRetry={() => me.refetch()} /> : <Loading />}
      </main>
    </div>
  );
}

export function Initials({ name, highlight = false }: { name: string; highlight?: boolean }) {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-bottle text-sm font-bold ${highlight ? "bg-butter" : "bg-white"}`}
    >
      {letters || "?"}
    </span>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return <p className="py-16 text-center text-moss" role="status">{label}…</p>;
}

export function LoadError({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="py-16 text-center" role="alert">
      <p className="mb-4">{message ?? "Couldn't load this. Check your connection."}</p>
      <button type="button" className="btn btn-quiet" onClick={onRetry}>Try again</button>
    </div>
  );
}
