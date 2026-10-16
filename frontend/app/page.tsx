import Link from "next/link";

import { TableScene } from "./components/table-scene";
import { Wordmark } from "./components/wordmark";

const STEPS = [
  { title: "Start a plan", body: "Pick the neighborhood and drop the link in your group chat." },
  { title: "Say what you want", body: "Everyone adds wishes in their own words, like “vegetarian” or “under $30”." },
  { title: "Get four picks", body: "TableUs looks at real places nearby and says why each one works for the whole group." },
  { title: "Vote and go", body: "Rank your top three. The organizer locks it in and everyone gets the address." },
];

const PICKS = [
  {
    name: "Trattoria Together",
    detail: "Italian, $$$",
    reason: "Handmade pasta at long shared tables, and they take reservations for big groups.",
  },
  {
    name: "Noodle Assembly",
    detail: "Vietnamese, $$",
    reason: "Bright, quick pho with vegetarian broths. Easy on a weeknight budget.",
  },
  {
    name: "Common Ground Tacos",
    detail: "Mexican, $$",
    reason: "A back patio, a big salsa bar and plenty without meat. Loud enough to relax.",
  },
];

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Wordmark />
        <Link href="/signin" className="btn btn-quiet">Sign in</Link>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-6 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[1fr_1.05fr] gap-y-10 lg:gap-10 lg:pb-20 lg:pt-12">
          <div>
            <h1 className="display text-[clamp(4.5rem,15vw,8.5rem)]">Dinner, decided.</h1>
            <p className="mt-6 max-w-[34ch] text-xl leading-relaxed">
              Share one link. Everyone says what they want. TableUs finds four places nearby that
              work for the whole group, and you vote.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/plans" className="btn btn-primary px-6 text-lg">Start a plan</Link>
              <span className="text-moss">Free during the beta. Friends join from any browser.</span>
            </div>
          </div>
          <TableScene />
        </section>

        <section aria-labelledby="how" className="border-y-2 border-bottle bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
            <h2 id="how" className="display text-5xl sm:text-6xl">How it works</h2>
            <ol className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span aria-hidden="true" className="display block text-7xl text-radicchio">{index + 1}</span>
                  <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 max-w-[30ch] text-moss">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="reasons" className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
          <h2 id="reasons" className="display max-w-[16ch] text-5xl sm:text-6xl">Every pick comes with a reason</h2>
          <p className="mt-4 max-w-[52ch] text-lg">
            No star ratings to argue over. Each option explains what makes it right for your group,
            so the vote is quick.
          </p>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {PICKS.map((pick, index) => (
              <li key={pick.name} className="rounded-[20px] border-2 border-bottle bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="display mb-1.5 text-3xl">{pick.name}</p>
                    <p className="text-sm font-semibold text-moss">{pick.detail}</p>
                  </div>
                  {index === 0 ? (
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-butter px-3 py-1 text-sm font-bold">Your 1st</span>
                  ) : null}
                </div>
                <p className="mt-4">{pick.reason}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-bottle text-leaf">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-20 sm:px-8 md:flex-row md:items-end md:justify-between">
            <h2 className="display max-w-[14ch] text-6xl sm:text-7xl">Next time someone asks where to eat, send a link.</h2>
            <Link href="/plans" className="btn bg-butter px-6 text-lg text-bottle hover:bg-[#f7da6c]">Start a plan</Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-moss sm:px-8">
        <p>TableUs, made for friends who can never decide.</p>
        <nav className="flex gap-5">
          <Link href="/privacy" className="underline underline-offset-4">Privacy</Link>
          <Link href="/terms" className="underline underline-offset-4">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
