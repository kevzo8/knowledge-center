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
  const GW = grouped.length * 64 + 30;
  const GH = 175;
  const BH = 118;

  // trend line across panels
  const TW = 560;
  const TH = 170;
  const yFor = (p: number) => 20 + (1 - p / 100) * 110;
  const xFor = (i: number, n: number) => (n === 1 ? TW / 2 : 30 + (i / (n - 1)) * (TW - 60));
  const validPanels = panels.map((p, i) => ({ ...p, i })).filter((p) => p.avg !== null);

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
            <svg viewBox={`0 0 ${GW} ${GH}`} className="mx-auto mt-2 w-full max-w-xl" role="img" aria-label="Quiz vs panel averages">
              {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                  <line x1="28" x2={GW - 4} y1={14 + (1 - v / 100) * BH} y2={14 + (1 - v / 100) * BH} stroke="currentColor" strokeOpacity="0.12" />
                  <text x="2" y={17 + (1 - v / 100) * BH} fontSize="9" className="fill-slate-500">{v}</text>
                </g>
              ))}
              {grouped.map((r, i) => {
                const x = 34 + i * 64;
                const q = r.quizAvg ?? 0;
                const e = r.evalAvg ?? 0;
                return (
                  <g key={r.username}>
                    <rect x={x} y={14 + (1 - q / 100) * BH} width="16" height={(q / 100) * BH} rx="4" fill="#8b5cf6" opacity={r.quizAvg === null ? 0.25 : 1} />
                    <rect x={x + 20} y={14 + (1 - e / 100) * BH} width="16" height={(e / 100) * BH} rx="4" fill="#10b981" opacity={r.evalAvg === null ? 0.25 : 1} />
                    <text x={x + 18} y={GH - 6} textAnchor="middle" fontSize="9.5" fontWeight="700" className="fill-slate-600 dark:fill-slate-300">
                      {r.displayName.split(" ")[0].slice(0, 9)}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
          <p className="mt-1 flex gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-violet-500" /> Quiz</span>
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Panel</span>
            <span>faded = not taken yet</span>
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Cohort panel trend</p>
          {validPanels.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No panels graded yet — grade Panel 1 in the Grading tab.</p>
          ) : (
            <svg viewBox={`0 0 ${TW} ${TH}`} className="mx-auto mt-2 w-full max-w-2xl" role="img" aria-label="Panel averages trend">
              {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                  <line x1="28" x2={TW - 8} y1={yFor(v)} y2={yFor(v)} stroke="currentColor" strokeOpacity="0.12" />
                  <text x="2" y={yFor(v) + 3} fontSize="9" className="fill-slate-500">{v}</text>
                </g>
              ))}
              {validPanels.map((p, k) => {
                const x = xFor(p.i, panels.length);
                const y = yFor(p.avg!);
                const nx = validPanels[k + 1] ? xFor(validPanels[k + 1].i, panels.length) : null;
                const ny = validPanels[k + 1] ? yFor(validPanels[k + 1].avg!) : null;
                return (
                  <g key={p.evaluationId}>
                    {nx !== null && <line x1={x} y1={y} x2={nx} y2={ny!} stroke="#f59e0b" strokeWidth="2.5" />}
                    <circle cx={x} cy={y} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
                    <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fontWeight="800" className="fill-slate-700 dark:fill-slate-200">
                      {p.avg}%
                    </text>
                    <text x={x} y={TH - 4} textAnchor="middle" fontSize="9.5" fontWeight="600" className="fill-slate-500">
                      {p.title.replace(/^Panel \d+: /, "").replace(/ demo$/, "").slice(0, 18)} ({p.graded})
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
