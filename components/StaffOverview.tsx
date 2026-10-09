"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import OverviewCharts from "./OverviewCharts";
import { ArrowRight, Settings2 } from "lucide-react";

function gradeLetter(avg: number | null) {
  if (avg === null) return "—";
  if (avg >= 90) return "S";
  if (avg >= 80) return "A";
  if (avg >= 70) return "B";
  if (avg >= 60) return "C";
  return "D";
}

export default function StaffOverview({ token }: { token: string }) {
  const data = useQuery((api as any)?.grading?.traineeOverview, { token }) as
    | { rows: any[]; panels: any[] }
    | undefined;

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-widest">Cohort overview — all trainees</h2>
        <Link href="/admin" className="btn-primary ml-auto inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold">
          <Settings2 size={13} /> Manage in Admin
        </Link>
      </div>
      {!data && <p className="text-sm text-slate-500">Loading cohort data…</p>}
      {data && (data.rows ?? []).length === 0 && (
        <p className="text-sm text-slate-500">No trainees yet — create accounts in Admin → Users.</p>
      )}
      {data && (data.rows ?? []).length > 0 && (
        <>
          <OverviewCharts rows={data.rows ?? []} panels={data.panels ?? []} />
          <div className="rounded-2xl border bg-white p-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-widest text-slate-500">
                    <th className="py-2 pr-3">Trainee</th>
                    <th className="pr-3">Lv</th>
                    <th className="pr-3">Total XP</th>
                    <th className="pr-3">Quiz avg</th>
                    <th className="pr-3">Graded avg</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => {
                    const combined = [r.quizAvg, r.evalAvg].filter((v) => v !== null) as number[];
                    const overall = combined.length
                      ? Math.round(combined.reduce((s, v) => s + v, 0) / combined.length)
                      : null;
                    return (
                      <tr key={r.username} className="border-t">
                        <td className="py-2 pr-3">
                          <p className="font-bold">{r.displayName}</p>
                          <p className="font-mono text-xs text-slate-500">@{r.username}</p>
                        </td>
                        <td className="pr-3 font-black">{r.level}</td>
                        <td className="pr-3 font-mono font-bold">{r.totalXp}</td>
                        <td className="pr-3 font-bold">{r.quizAvg !== null ? `${r.quizAvg}%` : "—"}</td>
                        <td className="pr-3 font-bold">{r.evalAvg !== null ? `${r.evalAvg}%` : "—"}</td>
                        <td className="font-display text-lg font-bold">{gradeLetter(overall)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Link href="/admin" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-indigo-600">
              Grade trainees in Admin <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
