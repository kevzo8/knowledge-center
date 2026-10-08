"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMe } from "../../../lib/useMe";
import { use, useState } from "react";
import Link from "next/link";
import ThemeToggle from "../../../components/ThemeToggle";

export default function DayPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = use(params);
  const { token, me } = useMe();
  const lectures = useQuery(
    (api as any)?.content?.listLectures,
    { dayId: dayId as any }
  ) as any[] | undefined;
  const activities = useQuery(
    (api as any)?.content?.listActivities,
    { dayId: dayId as any }
  ) as any[] | undefined;
  const quizzes = useQuery(
    (api as any)?.quizzes?.listQuizzes,
    { dayId: dayId as any }
  ) as any[] | undefined;

  const completeLecture = useMutation((api as any)?.quizzes?.completeLecture);
  const completeActivity = useMutation((api as any)?.quizzes?.completeActivity);
  const [msg, setMsg] = useState("");

  async function markLecture(id: string) {
    if (!token) return;
    await (completeLecture as any)({ token, lectureId: id as any });
    setMsg("Marked done +10 XP 🎉");
    setTimeout(() => setMsg(""), 2000);
  }
  async function markActivity(id: string) {
    if (!token) return;
    await (completeActivity as any)({ token, activityId: id as any });
    setMsg("Activity done — XP added 🎉");
    setTimeout(() => setMsg(""), 2000);
  }

  if (!me)
    return (
      <main className="p-10 text-center">
        Not logged in. <a href="/login" className="underline">Login</a>
      </main>
    );

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between gap-2">
        <Link href="/dashboard" className="text-sm underline">← All days</Link>
        <ThemeToggle />
      </div>
      {msg && <p className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm">{msg}</p>}

      <h1 className="mt-2 text-xl font-black">Lectures & slides</h1>
      <div className="mt-2 space-y-2">
        {lectures?.map((l) => (
          <div key={l._id} className="rounded-2xl border bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{l.kind}</p>
            <p className="font-bold">{l.title}</p>
            {l.fileName && <p className="text-xs text-slate-500">📎 {l.fileName}</p>}
            {l.notes && <p className="mt-1 text-sm text-slate-600">{l.notes}</p>}
            <div className="mt-2 flex gap-2">
              {l.url && (
                <a href={l.url} target="_blank" className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white">
                  Open link ↗
                </a>
              )}
              {token && (
                <button onClick={() => markLecture(l._id)} className="rounded-full border px-4 py-1.5 text-xs font-bold">
                  Mark done +10 XP
                </button>
              )}
            </div>
          </div>
        ))}
        {!lectures && <p className="text-sm text-slate-500">Loading…</p>}
      </div>

      <h1 className="mt-6 text-xl font-black">Activities</h1>
      <div className="mt-2 space-y-2">
        {activities?.map((a) => (
          <div key={a._id} className="rounded-2xl border bg-white p-4">
            <p className="font-bold">{a.title} <span className="text-xs text-indigo-600">+{a.points} XP</span></p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{a.instructions}</p>
            {token && (
              <button onClick={() => markActivity(a._id)} className="mt-2 rounded-full border px-4 py-1.5 text-xs font-bold">
                Mark done
              </button>
            )}
          </div>
        ))}
      </div>

      <h1 className="mt-6 text-xl font-black">Quizzes</h1>
      <div className="mt-2 space-y-2">
        {quizzes?.map((q) => (
          <div key={q._id} className="rounded-2xl border bg-white p-4">
            <p className="font-bold">{q.title}</p>
            {q.description && <p className="text-sm text-slate-600">{q.description}</p>}
            <QuizTaker quizId={q._id} token={token} />
          </div>
        ))}
        {quizzes?.length === 0 && <p className="text-sm text-slate-500">No quiz for this day yet.</p>}
      </div>
    </main>
  );
}

function QuizTaker({ quizId, token }: { quizId: string; token: string | null }) {
  const quiz = useQuery((api as any)?.quizzes?.getQuiz, { quizId: quizId as any }) as any;
  const submit = useMutation((api as any)?.quizzes?.submitQuiz);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);

  if (!quiz) return <p className="text-xs text-slate-500">Loading quiz…</p>;
  return (
    <div className="mt-2 space-y-3">
      {quiz.questions.map((q: any, qi: number) => (
        <div key={q._id} className="rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-bold">{qi + 1}. {q.prompt} <span className="font-normal text-slate-500">({q.points} pts)</span></p>
          <div className="mt-1 space-y-1">
            {q.choices.map((c: string, ci: number) => (
              <label key={ci} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`${quizId}-${qi}`}
                  checked={answers[qi] === ci}
                  onChange={() => {
                    const n = [...answers];
                    n[qi] = ci;
                    setAnswers(n);
                  }}
                />
                {c}
              </label>
            ))}
          </div>
        </div>
      ))}
      {token && (
        <button
          onClick={async () => {
            const r = await (submit as any)({ token, quizId: quizId as any, answers });
            setResult(r);
          }}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white"
        >
          Submit quiz
        </button>
      )}
      {result && (
        <p className="text-sm font-bold text-emerald-700">
          Score: {result.score}/{result.total} • +{result.xp} XP 🎉
        </p>
      )}
    </div>
  );
}
