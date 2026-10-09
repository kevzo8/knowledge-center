"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useMemo } from "react";

function gradeFor(avg: number | null) {
  if (avg === null) return { g: "—", label: "Take a quiz to earn a grade" };
  if (avg >= 90) return { g: "S", label: "Outstanding! 🏆" };
  if (avg >= 80) return { g: "A", label: "Great job! 💪" };
  if (avg >= 70) return { g: "B", label: "Good — keep pushing" };
  if (avg >= 60) return { g: "C", label: "Passing — aim higher" };
  return { g: "D", label: "Review + retake 📚" };
}

const GRADE_BG: Record<string, string> = {
  S: "bg-amber-100/80 dark:bg-amber-950/60",
  A: "bg-emerald-100/80 dark:bg-emerald-950/60",
  B: "bg-sky-100/80 dark:bg-sky-950/60",
  C: "bg-orange-100/80 dark:bg-orange-950/60",
  D: "bg-red-100/80 dark:bg-red-950/60",
  "—": "bg-slate-100 dark:bg-slate-800",
};

export default function ProgressSection({
  token,
  stats,
  board,
  username,
}: {
  token: string;
  stats: any;
  board: any[] | undefined;
  username: string;
}) {
  const history = useQuery((api as any)?.quizzes?.history, { token }) as
    | { xp: { xp: number; kind: string; at: number }[]; attempts: { quizTitle: string; score: number; total: number; at: number }[] }
    | undefined;

  const { cum, maxXp } = useMemo(() => {
    const evts = history?.xp ?? [];
    let run = 0;
    const cum = evts.map((e) => {
      run += e.xp;
      return run;
    });
    return { cum, maxXp: Math.max(run, 10) };
  }, [history]);

  const bestBars = useMemo(() => {
    const best = new Map<string, number>();
    for (const a of history?.attempts ?? []) {
      const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
      best.set(a.quizTitle, Math.max(best.get(a.quizTitle) ?? 0, pct));
    }
    return [...best.entries()];
  }, [history]);

  const avg = bestBars.length
    ? Math.round(bestBars.reduce((s, [, p]) => s + p, 0) / bestBars.length)
    : null;
  const grade = gradeFor(avg);
  const rank = board?.findIndex((r) => r.username === username) ?? -1;

  const W = 600;
  const H = 150;
  const PAD = 10;
  const pts = cum.map((v, i) => {
    const x = cum.length === 1 ? W / 2 : PAD + (i / (cum.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (v / maxXp) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = pts.length
    ? `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - PAD} L${pts[0][0].toFixed(1)},${H - PAD} Z`
    : "";

  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold uppercase tracking-widest">📊 My grades & progress</h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div className={`card-lift rounded-2xl border p-4 text-center ${GRADE_BG[grade.g] ?? GRADE_BG["—"]}`}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Grade</p>
          <p className="font-display text-5xl font-bold">{grade.g}</p>
          <p className="text-xs text-slate-500">{avg !== null ? `${avg}% quiz avg • ` : ""}{grade.label}</p>
        </div>
        <div className="card-lift rounded-2xl border bg-white p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Rank</p>
          <p className="font-display text-5xl font-bold">{rank >= 0 ? `#${rank + 1}` : "—"}</p>
          <p className="text-xs text-slate-500">
            {rank >= 0 && board ? `of ${board.length} trainees • ${stats?.xp ?? 0} XP` : "not ranked yet"}
          </p>
        </div>
        <div className="card-lift rounded-2xl border bg-white p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Level {stats?.level ?? 1}</p>
          <div className="mx-auto mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-orange-400"
              style={{ width: `${Math.min(100, ((stats?.xp ?? 0) % 100))}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">{stats?.xp ?? 0} total XP — earn more to level up</p>
        </div>
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">XP over time</p>
          {!history || cum.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No XP yet — open a lecture and mark it done. ✅</p>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="XP over time">
              <defs>
                <linearGradient id="xpArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#0a84ff" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#0a84ff" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1={PAD} x2={W - PAD} y1={H * f} y2={H * f} stroke="currentColor" strokeOpacity="0.12" />
              ))}
              <path d={area} fill="url(#xpArea)" />
              <path d={line} fill="none" stroke="#0a84ff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {pts.length > 0 && (
                <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="#0a84ff" />
              )}
            </svg>
          )}
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Best quiz scores</p>
          {bestBars.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No quizzes taken yet — take one from any day. 📝</p>
          ) : (
            <div className="mt-2 space-y-2">
              {bestBars.map(([title, pct]) => (
                <div key={title}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="truncate font-bold">{title}</span>
                    <span className="font-mono">{pct}%</span>
                  </div>
                  <div className="mt-0.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 80
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : pct >= 60
                            ? "bg-gradient-to-r from-amber-500 to-amber-400"
                            : "bg-gradient-to-r from-red-500 to-red-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
