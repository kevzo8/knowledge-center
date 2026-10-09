"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import type { Deck } from "../data/decks";
import Mermaid from "./Mermaid";

export default function SlideDeck({ deck }: { deck: Deck }) {
  const [i, setI] = useState(0);
  const n = deck.slides.length;
  useEffect(() => setI(0), [deck]);
  const go = useCallback(
    (d: number) => setI((v) => Math.min(n - 1, Math.max(0, v + d))),
    [n]
  );
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [go]);

  const groups = useMemo(() => {
    const out: { source: string; items: { idx: number; title: string }[] }[] = [];
    deck.slides.forEach((s, idx) => {
      const source = s.source ?? "Course";
      const g = out.find((x) => x.source === source);
      if (g) g.items.push({ idx, title: s.title });
      else out.push({ source, items: [{ idx, title: s.title }] });
    });
    return out;
  }, [deck]);

  const s = deck.slides[i];

  const outlineList = (compact = false) => (
    <div className={compact ? "mt-2 space-y-3" : "space-y-3"}>
      {groups.map((g) => (
        <div key={g.source}>
          <p className="px-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {g.source}
          </p>
          <ol className="mt-1 space-y-0.5">
            {g.items.map((it) => (
              <li key={it.idx}>
                <button
                  onClick={() => setI(it.idx)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition ${
                    it.idx === i
                      ? "bg-gradient-to-r from-sky-600 to-violet-600 font-bold text-white shadow"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold ${
                      it.idx === i ? "bg-white/25" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    {it.idx + 1}
                  </span>
                  <span className="leading-tight">{it.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <details className="rounded-2xl border bg-white px-4 py-2.5 lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold">
          <List size={15} /> Outline — slide {i + 1} of {n}
        </summary>
        {outlineList(true)}
      </details>

      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-4 max-h-[72vh] overflow-y-auto rounded-2xl border bg-white p-3">
          <p className="flex items-center gap-1.5 px-1 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            <List size={13} /> Outline
          </p>
          {outlineList()}
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-hidden rounded-3xl border bg-white shadow-xl">
        <div className="bg-gradient-to-r from-sky-600 via-violet-600 to-orange-400 px-5 py-4 text-white sm:px-8 sm:py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
            {deck.title} · {i + 1} / {n}
          </p>
          <p className="font-display text-xl font-bold leading-snug sm:text-2xl">{s.title}</p>
        </div>
        <ul className="space-y-2.5 px-5 py-5 sm:px-8">
          {s.points.map((p, k) => (
            <li key={k} className="flex items-start gap-2.5 text-sm leading-relaxed sm:text-[15px]">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-violet-500" />
              {p}
            </li>
          ))}
        </ul>
        {s.diagram && (
          <div className="px-5 pb-2 sm:px-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <Mermaid chart={s.diagram} />
            </div>
          </div>
        )}
        {s.source && (
          <p className="px-5 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-8">
            Source: {s.source}
          </p>
        )}
        <div className="flex items-center gap-2 px-5 py-4 sm:px-8">
          <button
            onClick={() => go(-1)}
            disabled={i === 0}
            aria-label="Previous slide"
            className="rounded-full border p-2 transition hover:scale-105 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex flex-1 items-center gap-1.5">
            {deck.slides.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                aria-label={`Go to slide ${k + 1}`}
                className={`h-1.5 flex-1 rounded-full transition ${
                  k === i ? "bg-gradient-to-r from-sky-500 to-violet-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => go(1)}
            disabled={i === n - 1}
            aria-label="Next slide"
            className="btn-primary rounded-full p-2 transition hover:scale-105 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
