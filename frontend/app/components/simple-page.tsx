import type { ReactNode } from "react";

import { Wordmark } from "./wordmark";

/** Narrow, centered page for sign-in and setup steps. */
export function SimplePage({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-5xl px-4 py-4 sm:px-6"><Wordmark /></header>
      <main className="mx-auto max-w-md px-4 pb-20 pt-8 sm:px-6">
        <h1 className="display text-6xl">{title}</h1>
        {intro ? <div className="mt-3 text-lg">{intro}</div> : null}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
