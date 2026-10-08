"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type CalDay = {
  _id: string;
  dayNo: number;
  week?: number;
  date?: string;
  title: string;
};

// Day 1 = Mon Oct 5, 2026. Weekdays only — weekends are skipped.
const START = new Date(2026, 9, 5);

function dateForDayNo(dayNo: number): Date {
  const d = new Date(START);
  let added = 0;
  let n = dayNo - 1;
  while (n > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) {
      n--;
    }
    added++;
    if (added > 365) break; // safety
  }
  return d;
}

function keyOf(y: number, m: number, d: number) {
  return `${y}-${m}-${d}`;
}

const WEEK_STYLE: Record<number, { cell: string; badge: string; label: string }> = {
  1: { cell: "bg-indigo-50 border-indigo-300 hover:bg-indigo-100", badge: "bg-indigo-600", label: "W1 Foundations" },
  2: { cell: "bg-fuchsia-50 border-fuchsia-300 hover:bg-fuchsia-100", badge: "bg-fuchsia-600", label: "W2 Java → War Card" },
  3: { cell: "bg-amber-50 border-amber-300 hover:bg-amber-100", badge: "bg-amber-500", label: "W3 Panel + Deep Java" },
  4: { cell: "bg-emerald-50 border-emerald-300 hover:bg-emerald-100", badge: "bg-emerald-600", label: "W4 Solitaire" },
};

function shortTitle(title: string) {
  return title.replace(/^Day \d+\s*[—–-]\s*/, "");
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TrainingCalendar({ days }: { days: CalDay[] | undefined }) {
  const router = useRouter();
  const [view, setView] = useState({ y: 2026, m: 9 }); // Oct 2026

  const byDate = useMemo(() => {
    const map = new Map<string, CalDay>();
    for (const d of days ?? []) {
      const dt = dateForDayNo(d.dayNo);
      map.set(keyOf(dt.getFullYear(), dt.getMonth(), dt.getDate()), d);
    }
    return map;
  }, [days]);

  const cells = useMemo(() => {
    // Monday-first grid
    const first = new Date(view.y, view.m, 1);
    const lead = (first.getDay() + 6) % 7;
    const dim = new Date(view.y, view.m + 1, 0).getDate();
    const out: { y: number; m: number; d: number; inMonth: boolean }[] = [];
    for (let i = 0; i < lead; i++) {
      const dt = new Date(view.y, view.m, 1 - lead + i);
      out.push({ y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate(), inMonth: false });
    }
    for (let d = 1; d <= dim; d++) out.push({ y: view.y, m: view.m, d, inMonth: true });
    while (out.length % 7 !== 0) {
      const last = out[out.length - 1];
      const dt = new Date(last.y, last.m, last.d + 1);
      out.push({ y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate(), inMonth: false });
    }
    return out;
  }, [view]);

  const today = new Date();
  const todayKey = keyOf(today.getFullYear(), today.getMonth(), today.getDate());

  function move(delta: number) {
    const dt = new Date(view.y, view.m + delta, 1);
    setView({ y: dt.getFullYear(), m: dt.getMonth() });
  }

  if (!days) return <p className="text-sm text-slate-500">Loading calendar…</p>;
  if (days.length === 0)
    return (
      <p className="text-sm text-slate-500">
        No days yet — run <code>seed:seedAll</code> in the Convex dashboard.
      </p>
    );

  return (
    <div className="rounded-2xl border bg-white p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <button onClick={() => move(-1)} aria-label="Previous month" className="rounded-full border px-3 py-1 text-sm font-bold hover:bg-slate-50">‹</button>
        <p className="flex-1 text-center font-display text-base font-bold sm:text-lg">
          {MONTHS[view.m]} {view.y}
        </p>
        <button onClick={() => move(1)} aria-label="Next month" className="rounded-full border px-3 py-1 text-sm font-bold hover:bg-slate-50">›</button>
        <button onClick={() => setView({ y: today.getFullYear(), m: today.getMonth() })} className="rounded-full border px-3 py-1 text-xs font-bold hover:bg-slate-50">
          Today
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-[11px]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) => {
          const t = byDate.get(keyOf(c.y, c.m, c.d));
          const isToday = keyOf(c.y, c.m, c.d) === todayKey;
          const st = t?.week ? WEEK_STYLE[t.week] : undefined;
          if (!t) {
            return (
              <div
                key={`${c.y}-${c.m}-${c.d}`}
                className={`min-h-[44px] rounded-xl px-1 py-1 text-xs sm:min-h-[64px] sm:text-sm ${
                  c.inMonth ? "text-slate-400" : "text-slate-300"
                } ${isToday ? "ring-2 ring-slate-400" : ""}`}
              >
                {c.d}
              </div>
            );
          }
          return (
            <button
              key={`${c.y}-${c.m}-${c.d}`}
              onClick={() => router.push(`/learn/${t._id}`)}
              title={t.title}
              className={`card-lift min-h-[44px] rounded-xl border px-1 py-1 text-left sm:min-h-[64px] ${st?.cell ?? "bg-slate-50"} ${
                isToday ? "ring-2 ring-slate-900" : ""
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="text-xs text-slate-500 sm:text-sm">{c.d}</span>
                <span className={`rounded-full px-1.5 py-px text-[9px] font-bold text-white sm:text-[10px] ${st?.badge ?? "bg-slate-500"}`}>
                  D{t.dayNo}
                </span>
              </span>
              <span className="mt-0.5 hidden text-[11px] font-medium leading-tight sm:line-clamp-2">
                {shortTitle(t.title)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {[1, 2, 3, 4].map((w) => (
          <span key={w} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold">
            <span className={`h-2 w-2 rounded-full ${WEEK_STYLE[w].badge}`} />
            {WEEK_STYLE[w].label}
          </span>
        ))}
      </div>
    </div>
  );
}
