import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

const WEEKS = [
  {
    w: "Week 1 — Foundations (Oct 5–9)",
    days: [
      "Day 1 — Introduction, Expectation Setting & Career Paths + 3 PDF readings",
      "Day 2 — SDLC",
      "Day 3 — Basic Computer Concepts",
      "Day 4 — Batch Jobs & Batch Processing",
      "Day 5 — Databases + Sort & Search",
    ],
  },
  {
    w: "Week 2 — Logic → Java → War Card (Oct 12–16)",
    days: [
      "Day 6 — Flowcharting + Pseudocoding",
      "Day 7 — Java Intro & Setup",
      "Day 8 — Java Fundamentals",
      "Day 9 — OOP Essentials",
      "Day 10 — War Card Game: design + code v1 🃏",
    ],
  },
  {
    w: "Week 3 — Panel + Deep Java (Oct 19–23)",
    days: [
      "Day 11 — Panel / Evaluation 1: War Card demo",
      "Day 12 — Collections, Exceptions & File I/O",
      "Day 13 — Clean Code: DRY & SOLID",
      "Day 14 — Concurrency Basics",
      "Day 15 — War Card v2 polish + quiz",
    ],
  },
  {
    w: "Week 4 — Solitaire Capstone (Oct 26–30)",
    days: [
      "Day 16 — Klondike rules & decomposition",
      "Day 17 — Solitaire build: state + moves",
      "Day 18 — Solitaire enhanced: undo, scoring, polish ✨",
      "Day 19 — Testing, edge cases & docs",
      "Day 20 — Final panel, demo & graduation 🎓",
    ],
  },
];

export default function Home() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16 text-center">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600">
        SVI Knowledge Center
      </p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
        Learn by day. <span className="text-gradient">Practice. Level up.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-slate-600">
        4 weeks, 20 days (Oct 5–30). War Card v1 → v2 → Solitaire capstone.
        Admin creates accounts — no self-signup.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/login"
          className="btn-primary rounded-full px-6 py-3 text-sm font-bold"
        >
          Log in →
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border px-6 py-3 text-sm font-bold"
        >
          Dashboard
        </Link>
      </div>
      <div className="mx-auto mt-10 space-y-4 text-left">
        {WEEKS.map((week) => (
          <div key={week.w} className="card-lift rounded-2xl border bg-white p-4">
            <p className="text-sm font-black">{week.w}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {week.days.map((d) => (
                <li key={d} className="rounded-lg bg-slate-50 px-3 py-1.5">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
