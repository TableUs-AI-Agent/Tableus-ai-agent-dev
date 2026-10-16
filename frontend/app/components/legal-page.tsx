import type { ReactNode } from "react";

import { Wordmark } from "./wordmark";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-5xl px-4 py-4 sm:px-6"><Wordmark /></header>
      <main className="mx-auto max-w-[68ch] px-4 pb-24 pt-6 sm:px-6">
        <h1 className="display text-6xl">{title}</h1>
        <p className="mt-2 text-moss">Last updated {updated}</p>
        <div className="mt-8 space-y-4 text-[1.0625rem] leading-relaxed [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-6 [&_h2]:text-xl [&_h2]:font-bold">
          {children}
        </div>
      </main>
    </div>
  );
}
