"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Deck } from "../data/decks";

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

  const s = deck.slides[i];
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-xl">
      <div className="bg-gradient-to-r from-sky-600 via-violet-600 to-orange-400 px-5 py-4 text-white sm:px-8 sm:py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
          {deck.title} · {i + 1} / {n}
        </p>
        <p className="font-display text-xl font-bold leading-snug sm:text-2xl">{s.title}</p>
      </div>
      <ul className="min-h-[180px] space-y-2.5 px-5 py-5 sm:min-h-[200px] sm:px-8">
        {s.points.map((p, k) => (
          <li key={k} className="flex items-start gap-2.5 text-sm leading-relaxed sm:text-[15px]">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-violet-500" />
            {p}
          </li>
        ))}
      </ul>
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
  );
}
