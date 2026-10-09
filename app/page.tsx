"use client";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import TrainingCalendar from "../components/TrainingCalendar";
import { Award, BookOpen, CalendarDays, ClipboardCheck, FlaskConical, Lock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import { getToken } from "../lib/auth-token";

export default function Home() {
  const days = useQuery((api as any)?.content?.listDays, {}) as any[] | undefined;
  const [locked, setLocked] = useState<boolean | null>(null);
  useEffect(() => {
    setLocked(!getToken());
  }, []);

  return (
    <main className="relative mx-auto max-w-6xl px-6 py-14">
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
        {locked !== false && (
          <Link
            href="/login"
            className="btn-primary rounded-full px-4 py-2 text-xs font-bold"
          >
            Log in
          </Link>
        )}
        {locked === false && (
          <Link
            href="/dashboard"
            className="rounded-full border bg-white px-4 py-2 text-xs font-bold"
          >
            Dashboard
          </Link>
        )}
        <ThemeToggle compact />
      </div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600">
          SVI Knowledge Center
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Learn by day. <span className="text-gradient">Practice. Level up.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Four weeks, twenty days — from computer basics to Java and OOP,
          ending in panel-judged card games. Earn XP for every lesson,
          activity, and quiz along the way.
        </p>
        <p className="mx-auto mt-2 max-w-xl text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Oct 5–30 · War Card → Solitaire · Just log in, your admin handles accounts
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-5xl">
        <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest">
          <CalendarDays size={15} /> Training calendar — tap a day to open it
        </h2>
        {locked === true && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Lock size={13} /> Not logged in — tapping a day will take you to login first.
          </p>
        )}
        <div className="mt-2">
          <TrainingCalendar days={days} redirectTo={locked ? "/login" : undefined} />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-5xl">
        <h2 className="text-sm font-bold uppercase tracking-widest">How XP works</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <BookOpen size={16} />, tint: "bg-sky-100/70 dark:bg-sky-950/50", title: "Lectures +10 XP", body: "Open any sticky note and hit Mark done." },
            { icon: <FlaskConical size={16} />, tint: "bg-orange-100/70 dark:bg-orange-950/50", title: "Activities +20–40 XP", body: "Hands-on work — each card shows its points." },
            { icon: <ClipboardCheck size={16} />, tint: "bg-violet-100/70 dark:bg-violet-950/50", title: "Quizzes = score + bonus", body: "You earn what you score, +20% extra for a perfect run." },
            { icon: <Award size={16} />, tint: "bg-emerald-100/70 dark:bg-emerald-950/50", title: "Panels = % × pool", body: "Trainers grade panels against the rubric; 85% of 100 XP pool = 85 XP." },
          ].map((c) => (
            <div key={c.title} className={`card-lift rounded-2xl border p-4 ${c.tint}`}>
              <span className="inline-flex items-center gap-1.5 text-sm font-black">{c.icon} {c.title}</span>
              <p className="mt-1 text-xs text-slate-500">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          Levels: L1 0–99 · L2 100–249 · L3 250–499 · L4 500–899 · L5+ every 500 XP. Quiz/panel averages map to grades S/A/B/C/D.
        </p>
      </div>
    </main>
  );
}
