"use client";

export type OverviewRow = {
  username: string;
  displayName: string;
  level: number;
  totalXp: number;
  lectureXp: number;
  lecturesDone: number;
  quizXp: number;
  quizAvg: number | null;
  quizzesTaken: number;
  activityXp: number;
  activitiesDone: number;
  evalXp: number;
  evalAvg: number | null;
  evalsGraded: number;
};

export type PanelStat = {
  evaluationId: string;
  title: string;
  graded: number;
  avg: number | null;
};

function gradeLetter(avg: number | null) {
  if (avg === null) return "—";
  if (avg >= 90) return "S";
  if (avg >= 80) return "A";
  if (avg >= 70) return "B";
  if (avg >= 60) return "C";
  return "D";
}

const CATS = [
  { key: "lectureXp", label: "Lectures", color: "#0ea5e9" },
  { key: "quizXp", label: "Quizzes", color: "#8b5cf6" },
  { key: "activityXp", label: "Activities", color: "#f97316" },
  { key: "evalXp", label: "Panels", color: "#10b981" },
] as const;

export default function OverviewCharts({ rows, panels }: { rows: OverviewRow[]; panels: PanelStat[] }) {
  const sum = (k: (typeof CATS)[number]["key"]) => rows.reduce((s, r) => s + r[k], 0);
  const catTotals = CATS.map((c) => ({ ...c, total: sum(c.key) }));
  const grand = catTotals.reduce((s, c) => s + c.total, 0);
  const quizAvgs = rows.map((r) => r.quizAvg).filter((v) => v !== null) as number[];
  const evalAvgs = rows.map((r) => r.evalAvg).filter((v) => v !== null) as number[];
  const avgQuiz = quizAvgs.length ? Math.round(quizAvgs.reduce((s, v) => s + v, 0) / quizAvgs.length) : null;
  const avgPanel = evalAvgs.length ? Math.round(evalAvgs.reduce((s, v) => s + v, 0) / evalAvgs.length) : null;
  const combined = [...quizAvgs, ...evalAvgs];
  const overall = combined.length ? Math.round(combined.reduce((s, v) => s + v, 0) / combined.length) : null;
  const top = [...rows].sort((a, b) => b.totalXp - a.totalXp).slice(0, 8);
  const maxXp = Math.max(...top.map((r) => r.totalXp), 1);

  // donut geometry
  const R = 54;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const slices = catTotals.map((c) => {
    const frac = grand ? c.total / grand : 0;
    const s = { ...c, frac, offset: -acc };
    acc += frac * C;
    return s;
  });

  // grouped bars (quiz vs panel avg), top 6
  const grouped = top.slice(0, 6);

  // trend steps across panels (newest data model: panels with avg or null)
  const trendPanels = panels;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Trainees", String(rows.length), "bg-sky-100/70 dark:bg-sky-950/50"],
          ["Total XP", String(grand), "bg-violet-100/70 dark:bg-violet-950/50"],
          ["Cohort grade", overall !== null ? `${gradeLetter(overall)} · ${overall}%` : "—", "bg-emerald-100/70 dark:bg-emerald-950/50"],
          ["Quiz / Panel avg", `${avgQuiz !== null ? `${avgQuiz}%` : "—"} / ${avgPanel !== null ? `${avgPanel}%` : "—"}`, "bg-amber-100/70 dark:bg-amber-950/50"],
        ].map(([k, v, tint]) => (
          <div key={k} className={`rounded-2xl border p-3 text-center ${tint}`}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{k}</p>
            <p className="text-xl font-black">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Where XP comes from</p>
          {grand === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No XP earned yet.</p>
          ) : (
            <div className="mt-1 flex flex-col items-center gap-3 sm:flex-row">
              <svg viewBox="0 0 140 140" className="h-40 w-40 shrink-0" role="img" aria-label="XP by category">
                <g transform="rotate(-90 70 70)">
                  {slices.map((s) =>
                    s.frac <= 0 ? null : (
                      <circle
                        key={s.key}
                        cx="70"
                        cy="70"
                        r={R}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="22"
                        strokeDasharray={`${(s.frac * C).toFixed(1)} ${C.toFixed(1)}`}
                        strokeDashoffset={s.offset.toFixed(1)}
                      />
                    )
                  )}
                </g>
                <text x="70" y="66" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200" fontSize="20" fontWeight="800">
                  {grand}
                </text>
                <text x="70" y="84" textAnchor="middle" className="fill-slate-500" fontSize="11">
                  total XP
                </text>
              </svg>
              <ul className="w-full space-y-1.5 text-sm">
                {slices.map((s) => (
                  <li key={s.key} className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 font-bold">{s.label}</span>
                    <span className="font-mono text-xs text-slate-500">
                      {s.total} ({grand ? Math.round((s.total / grand) * 100) : 0}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">XP per trainee</p>
          {top.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No trainees.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {top.map((r) => (
                <div key={r.username}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="truncate font-bold">{r.displayName}</span>
                    <span className="font-mono">Lv{r.level} · {r.totalXp} XP</span>
                  </div>
                  <div className="mt-0.5 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-orange-400"
                      style={{ width: `${Math.max(2, Math.round((r.totalXp / maxXp) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Quiz avg vs panel avg (per trainee)</p>
          {grouped.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No trainees.</p>
          ) : (
            <div className="mt-2 space-y-2.5">
              {grouped.map((r) => (
                <div key={r.username}>
                  <p className="truncate text-xs font-bold">{r.displayName}</p>
                  {(
                    [
                      ["Quiz", r.quizAvg, "bg-violet-500"],
                      ["Panel", r.evalAvg, "bg-emerald-500"],
                    ] as const
                  ).map(([label, val, bar]) => (
                    <div key={label} className="mt-1 flex items-center gap-2">
                      <span className="w-11 shrink-0 text-[10px] font-bold uppercase text-slate-500">{label}</span>
                      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${bar}`}
                          style={{ width: `${val ?? 0}%`, opacity: val === null ? 0.25 : 1 }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right font-mono text-[11px]">
                        {val !== null ? `${val}%` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-[11px] text-slate-500">Faded bar = not taken / not graded yet.</p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Cohort grading journey</p>
          {trendPanels.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No evaluations yet.</p>
          ) : (
            <div className="mt-2">
              {trendPanels.map((p, i) => (
                <div key={p.evaluationId} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${
                        p.avg === null
                          ? "bg-slate-300 dark:bg-slate-600"
                          : p.avg >= 80
                            ? "bg-emerald-500"
                            : p.avg >= 60
                              ? "bg-amber-500"
                              : "bg-red-400"
                      }`}
                    >
                      {p.avg !== null ? `${p.avg}` : "–"}
                    </span>
                    {i < trendPanels.length - 1 && <span className="w-0.5 flex-1 bg-orange-200 dark:bg-orange-900" />}
                  </div>
                  <div className={i < trendPanels.length - 1 ? "pb-4" : ""}>
                    <p className="text-sm font-bold">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.avg !== null ? `cohort average ${p.avg}% • ` : "not graded yet • "}{p.graded} graded
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
