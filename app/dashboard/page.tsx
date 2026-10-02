"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMe } from "../../lib/useMe";
import { clearToken } from "../../lib/auth-token";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { token, me, loading } = useMe();
  const router = useRouter();
  const days = useQuery((api as any)?.content?.listDays, {}) as any[] | undefined;
  const stats = useQuery(
    (api as any)?.quizzes?.myStats,
    token ? { token } : "skip"
  ) as any;
  const board = useQuery(
    (api as any)?.quizzes?.leaderboard,
    token ? { token, limit: 10 } : "skip"
  ) as any[];

  if (loading) return <p className="p-10 text-center text-sm">Loading…</p>;
  if (!token || !me)
    return (
      <main className="p-10 text-center">
        <p>Not logged in.</p>
        <a href="/login" className="underline">Go to login</a>
      </main>
    );
  const user = me as { username: string; role: string; displayName: string };

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex items-center gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600">
            SVI Knowledge Center
          </p>
          <h1 className="text-2xl font-black">
            Hi, {user.displayName} 👋
            <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 align-middle text-[11px] font-bold uppercase text-white">
              {user.role}
            </span>
          </h1>
        </div>
        <div className="ml-auto flex gap-2">
          {(user.role === "admin" || user.role === "trainer") && (
            <Link href="/admin" className="rounded-full border px-4 py-2 text-sm font-bold">
              Admin
            </Link>
          )}
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

      {stats && (
        <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ["Level", stats.level],
            ["XP", stats.xp],
            ["Lectures", stats.lecturesDone],
            ["Activities", stats.activitiesDone],
            ["Quizzes", stats.quizzesTaken],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-2xl border bg-white p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{k}</p>
              <p className="text-2xl font-black">{String(v)}</p>
            </div>
          ))}
        </section>
      )}

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest">Training days (Oct 5–30)</h2>
          <div className="mt-2 space-y-2">
            {days?.map((d) => (
              <Link
                key={d._id}
                href={`/learn/${d._id}`}
                className="block rounded-2xl border bg-white p-4 hover:shadow"
              >
                <p className="text-xs font-bold text-indigo-600">
                  DAY {d.dayNo}
                  {d.week ? ` • WEEK ${d.week}` : ""}
                  {d.date ? ` • ${d.date}` : ""}
                </p>
                <p className="font-bold">{d.title}</p>
                {d.summary && <p className="mt-1 text-sm text-slate-600">{d.summary}</p>}
              </Link>
            ))}
            {!days && <p className="text-sm text-slate-500">Loading days… (run seed if empty)</p>}
            {days && days.length === 0 && (
              <p className="text-sm text-slate-500">
                No days yet — run <code>seed:seedAll</code> in the Convex dashboard.
              </p>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest">🏆 Leaderboard</h2>
          <div className="mt-2 space-y-1.5">
            {board?.map((r, i) => (
              <div
                key={r.username}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  r.username === user.username ? "bg-indigo-50 border-indigo-300" : "bg-white"
                }`}
              >
                <span className="w-6 font-black">#{i + 1}</span>
                <span className="flex-1 truncate font-semibold">{r.displayName}</span>
                <span className="font-mono text-xs">Lv{r.level} • {r.xp}xp</span>
              </div>
            ))}
            {!board && <p className="text-sm text-slate-500">Loading…</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
