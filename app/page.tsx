"use client";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import TrainingCalendar from "../components/TrainingCalendar";
import { CalendarDays, Lock } from "lucide-react";
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
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600">
          SVI Knowledge Center
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Learn by day. <span className="text-gradient">Practice. Level up.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          4 weeks, 20 days (Oct 5–30). War Card v1 → v2 → Solitaire capstone.
          Admin creates accounts — no self-signup.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
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
    </main>
  );
}
