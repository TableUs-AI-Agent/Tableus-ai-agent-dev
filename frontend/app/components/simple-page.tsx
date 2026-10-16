import type { ReactNode } from "react";

import { Pip, type PipPose } from "./pip";
import { Wordmark } from "./wordmark";

/** Narrow, centered page for sign-in and setup steps. */
export function SimplePage({ title, intro, pip, children }: {
  title: string;
  intro?: ReactNode;
  pip?: PipPose;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-5xl px-4 py-4 sm:px-6"><Wordmark /></header>
      <main className="mx-auto max-w-md px-4 pb-20 pt-8 sm:px-6">
        <div className="flex items-end justify-between gap-3">
          <h1 className="display text-6xl">{title}</h1>
          {pip ? <Pip pose={pip} size={96} eager className="-mb-2" /> : null}
        </div>
        {intro ? <div className="mt-3 text-lg">{intro}</div> : null}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
