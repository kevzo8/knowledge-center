"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMe } from "../../lib/useMe";
import { clearToken } from "../../lib/auth-token";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProgressSection from "../../components/ProgressSection";
import StaffOverview from "../../components/StaffOverview";
import ThemeToggle from "../../components/ThemeToggle";
import { CalendarDays, Inbox, Settings, Trophy } from "lucide-react";

type BoardTab = "xp" | "quiz" | "panel" | "activities";

export default function Dashboard() {
  const { token, me, loading } = useMe();
  const router = useRouter();
  const [boardTab, setBoardTab] = useState<BoardTab>("xp");
  const stats = useQuery(
    (api as any)?.quizzes?.myStats,
    token ? { token } : "skip"
  ) as any;
  const board = useQuery(
    (api as any)?.quizzes?.leaderboard,
    token ? { token, limit: 10 } : "skip"
  ) as any[];
  const standings = useQuery(
    (api as any)?.quizzes?.standings,
    token ? { token } : "skip"
  ) as any[] | undefined;

  if (loading) return <p className="p-10 text-center text-sm">Loading…</p>;
  if (!token || !me)
    return (
      <main className="p-10 text-center">
        <p>Not logged in.</p>
        <a href="/login" className="underline">Go to login</a>
      </main>
    );
  const user = me as { username: string; role: string; displayName: string };
  const isStaff = user.role === "admin" || user.role === "trainer";

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <header className="flex items-center gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <img
            src="/svi_logo.png"
            alt="SVI home"
            className="h-11 w-11 shrink-0 rounded-2xl bg-white object-contain p-1 shadow-md"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600">
              SVI Knowledge Center
            </p>
            <h1 className="truncate text-2xl font-black">
              Hi, {user.displayName}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 align-middle text-[11px] font-bold uppercase text-white ${
                user.role === "admin"
                  ? "bg-violet-600 dark:bg-violet-500"
                  : user.role === "trainer"
                    ? "bg-sky-600 dark:bg-sky-500"
                    : "bg-emerald-600 dark:bg-emerald-500"
              }`}
            >
              {user.role}
            </span>
          </h1>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/settings" className="inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-bold">
            <Settings size={14} /> Settings
          </Link>
          <button
            onClick={() => {
              clearToken();
              router.push("/login");
            }}
            className="rounded-full border px-4 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {isStaff ? (
        <StaffOverview token={token} />
      ) : (
      <>
      <section className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link
          href="/"
          className="card-lift flex items-center justify-between rounded-2xl border bg-white p-4"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-widest text-indigo-600">Training calendar</span>
            <span className="block font-bold">Browse all 20 days →</span>
          </span>
          <CalendarDays size={24} className="text-indigo-600" />
        </Link>
        <Link
          href="/feedback"
          className="card-lift flex items-center justify-between rounded-2xl border bg-white p-4"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-widest text-indigo-600">Suggestion box</span>
            <span className="block font-bold">Ask, suggest, comment →</span>
          </span>
          <Inbox size={24} className="text-indigo-600" />
        </Link>
      </section>

      {stats && (
        <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ["Level", stats.level, "bg-sky-100/70 dark:bg-sky-950/50"],
            ["XP", stats.xp, "bg-amber-100/70 dark:bg-amber-950/50"],
            ["Lectures", stats.lecturesDone, "bg-emerald-100/70 dark:bg-emerald-950/50"],
            ["Activities", stats.activitiesDone, "bg-orange-100/70 dark:bg-orange-950/50"],
            ["Quizzes", stats.quizzesTaken, "bg-violet-100/70 dark:bg-violet-950/50"],
          ].map(([k, v, tint]) => (
            <div key={k as string} className={`rounded-2xl border p-3 text-center ${tint as string}`}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{k}</p>
              <p className="text-2xl font-black">{String(v)}</p>
            </div>
          ))}
        </section>
      )}

      <ProgressSection token={token} stats={stats} board={board} username={user.username} />
      </>
      )}

      <section className="mt-6">
        <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest">
          <Trophy size={15} /> Leaderboard — top trainees
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(
            [
              ["xp", "XP"],
              ["quiz", "Quizzes"],
              ["panel", "Panels"],
              ["activities", "Activities"],
            ] as [BoardTab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setBoardTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${boardTab === t ? "btn-primary" : "border"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {!standings && <p className="mt-2 text-sm text-slate-500">Loading…</p>}
        {standings && standings.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">
            No XP yet — finish a lecture or quiz to get on the board.
          </p>
        )}
        {standings && standings.length > 0 && (
          <BoardList tab={boardTab} rows={standings} username={user.username} />
        )}
      </section>
    </main>
  );
}

function BoardList({ tab, rows, username }: { tab: BoardTab; rows: any[]; username: string }) {
  const sorted = [...rows].sort((a, b) => {
    if (tab === "xp") return b.totalXp - a.totalXp;
    if (tab === "activities") return b.activitiesDone - a.activitiesDone || b.totalXp - a.totalXp;
    const av = tab === "quiz" ? a.quizAvg : a.evalAvg;
    const bv = tab === "quiz" ? b.quizAvg : b.evalAvg;
    if (av === null && bv === null) return b.totalXp - a.totalXp;
    if (av === null) return 1;
    if (bv === null) return -1;
    return bv - av;
  });
  const metric = (r: any) => {
    if (tab === "xp") return `Lv${r.level} • ${r.totalXp} XP`;
    if (tab === "quiz") return r.quizAvg !== null ? `${r.quizAvg}% avg • ${r.quizzesTaken} taken` : "no quizzes yet";
    if (tab === "panel") return r.evalAvg !== null ? `${r.evalAvg}% avg • ${r.evalsGraded} graded` : "not graded yet";
    return `${r.activitiesDone} done • ${r.lecturesDone} lectures`;
  };
  const top = sorted.slice(0, 3);
  const rest = sorted.slice(3, 10);
  return (
    <div className="mt-2">
      <div className="grid gap-2 sm:grid-cols-3">
        {top.map((r, i) => (
          <div
            key={r.username}
            className={`card-lift rounded-2xl border bg-white p-4 text-center ${
              r.username === username ? "border-indigo-400 ring-1 ring-indigo-300 dark:border-indigo-500 dark:ring-indigo-700" : ""
            }`}
          >
            <span
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                [
                  "bg-amber-300 text-amber-950 dark:bg-amber-500/30 dark:text-amber-200",
                  "bg-slate-300 text-slate-800 dark:bg-slate-500/30 dark:text-slate-200",
                  "bg-orange-300 text-orange-950 dark:bg-orange-500/30 dark:text-orange-200",
                ][i]
              }`}
            >
              {i + 1}
            </span>
            <p className="mt-1 truncate font-bold">{r.displayName}</p>
            <p className="font-mono text-xs text-slate-500">{metric(r)}</p>
          </div>
        ))}
      </div>
      {rest.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {rest.map((r, i) => (
            <div
              key={r.username}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                r.username === username ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-700" : "bg-white"
              }`}
            >
              <span className="w-8 font-black">#{i + 4}</span>
              <span className="flex-1 truncate font-semibold">{r.displayName}</span>
              <span className="font-mono text-xs">{metric(r)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
