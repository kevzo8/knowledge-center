"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, MonitorPlay } from "lucide-react";
import ThemeToggle from "../../../components/ThemeToggle";
import SlideDeck from "../../../components/SlideDeck";
import { DECKS } from "../../../data/decks";

export default function SlidesPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = use(params);
  const day = useQuery((api as any)?.content?.getDay, { dayId: dayId as any }) as any;

  if (day === undefined) {
    return <p className="p-10 text-center text-sm text-slate-400">Loading slides…</p>;
  }

  const deck = day ? DECKS[day.dayNo] : null;

  return (
    <main className="min-h-screen bg-[#0b0e1a] text-slate-100">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 15% 0%, rgba(10,132,255,0.18), transparent 65%), radial-gradient(90% 60% at 85% 5%, rgba(191,90,242,0.14), transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-3 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            href={day ? `/learn/${dayId}` : "/"}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft size={13} /> {day ? `Day ${day.dayNo}` : "Home"}
          </Link>
          <p className="ml-1 hidden items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-slate-400 sm:inline-flex">
            <MonitorPlay size={14} /> Lecture slides
          </p>
          <div className="ml-auto [&_button]:border-white/15 [&_button]:bg-white/10 [&_button]:text-white">
            <ThemeToggle />
          </div>
        </div>

        {!deck ? (
          <div className="mt-16 text-center">
            <p className="font-display text-2xl font-bold">No slide deck for this day yet.</p>
            <p className="mt-2 text-sm text-slate-400">
              The documents below are still the way to go.
            </p>
            <Link
              href={day ? `/learn/${dayId}` : "/"}
              className="btn-primary mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-bold"
            >
              Back to the day
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 text-center">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{deck.title}</h1>
              {deck.subtitle && (
                <p className="mx-auto mt-1 max-w-xl text-sm text-slate-400">{deck.subtitle}</p>
              )}
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                {deck.slides.length} slides · ← → to navigate
              </p>
            </div>
            <div className="mt-5">
              <SlideDeck deck={deck} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
