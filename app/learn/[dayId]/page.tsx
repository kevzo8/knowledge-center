"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMe } from "../../../lib/useMe";
import { use, useState } from "react";
import Link from "next/link";
import ThemeToggle from "../../../components/ThemeToggle";
import { BookOpen, Check, ExternalLink, FlaskConical, Paperclip } from "lucide-react";
import SlideDeck from "../../../components/SlideDeck";
import { DECKS } from "../../../data/decks";

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
  const day = useQuery((api as any)?.content?.getDay, { dayId: dayId as any }) as any;
  const deck = day ? DECKS[day.dayNo] : undefined;
  const completions = useQuery(
    (api as any)?.quizzes?.myCompletions,
    token ? { token } : "skip"
  ) as { lectures: string[]; activities: string[] } | undefined;
  const myGrades = useQuery(
    (api as any)?.grading?.myGrades,
    token ? { token } : "skip"
  ) as any[] | undefined;
  const doneLectures = new Set(completions?.lectures ?? []);
  const doneActivities = new Set(completions?.activities ?? []);
  const gradeForActivity = (id: string) => myGrades?.find((g) => g.activityId === id);

  const completeLecture = useMutation((api as any)?.quizzes?.completeLecture);
  const completeActivity = useMutation((api as any)?.quizzes?.completeActivity);
  const [msg, setMsg] = useState("");

  async function markLecture(id: string) {
    if (!token) return;
    await (completeLecture as any)({ token, lectureId: id as any });
    setMsg("Lecture done — +10 XP");
    setTimeout(() => setMsg(""), 2000);
  }
  async function markActivity(id: string) {
    if (!token) return;
    await (completeActivity as any)({ token, activityId: id as any });
    setMsg("Submitted — your trainer will grade it");
    setTimeout(() => setMsg(""), 2000);
  }

  if (!me)
    return (
      <main className="p-10 text-center">
        Not logged in. <a href="/login" className="underline">Login</a>
      </main>
    );

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex items-center justify-between gap-2">
        <Link href="/dashboard" className="text-sm underline">← All days</Link>
        <ThemeToggle />
      </div>
      {msg && (
        <p className="mt-2 flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-200">
          <Check size={15} /> {msg}
        </p>
      )}

      {deck && (
        <>
          <h1 className="mt-2 text-xl font-black">{deck.title}</h1>
          {deck.subtitle && <p className="mt-1 text-sm text-slate-500">{deck.subtitle}</p>}
          <div className="mt-3">
            <SlideDeck deck={deck} />
          </div>
        </>
      )}

      <h1 className="mt-8 flex items-center gap-2 text-xl font-black">
        <BookOpen size={20} /> Lectures & Documents
      </h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lectures?.map((l, i) => (
          <div key={l._id} className={`sticky-note ${SN[i % SN.length]}`}>
            <p className="sn-kind">{l.kind}</p>
            <p className="mt-1.5 text-sm font-bold leading-snug">{l.title}</p>
            {(l.fileId || l.fileName || l.url) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold">
                {l.fileId ? (
                  <LectureFile fileId={l.fileId} fileName={l.fileName ?? "attachment"} />
                ) : (
                  l.fileName && (
                    <span className="inline-flex items-center gap-1">
                      <Paperclip size={11} /> {l.fileName}
                    </span>
                  )
                )}
                {l.url && (
                  <a href={l.url} target="_blank" className="sn-link inline-flex items-center gap-0.5">
                    Open link <ExternalLink size={11} />
                  </a>
                )}
              </div>
            )}
            {l.notes && <p className="mt-1.5 text-[11px] opacity-80 line-clamp-3">{l.notes}</p>}
            {token && (
              doneLectures.has(l._id) ? (
                <span className="sn-done mt-2">
                  <Check size={12} /> Completed +10 XP
                </span>
              ) : (
                <button onClick={() => markLecture(l._id)} className="sn-btn mt-2 inline-flex items-center gap-1">
                  <Check size={12} /> Mark done +10 XP
                </button>
              )
            )}
          </div>
        ))}
        {!lectures && <p className="text-sm text-slate-500">Loading…</p>}
      </div>

      <h1 className="mt-8 flex items-center gap-2 text-xl font-black">
        <FlaskConical size={20} /> Activities
      </h1>
      <p className="mt-1 text-sm text-slate-500">Submit your work — trainers grade it against a rubric. XP = score % × pool.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities?.map((a, i) => {
          const grade = gradeForActivity(a._id);
          const earned = grade ? Math.round((grade.percent * (grade.points || a.points)) / 100) : 0;
          return (
          <div key={a._id} className={`sticky-note ${SN[(i + 2) % SN.length]}`}>
            <p className="sn-kind">Up to {a.points} XP · trainer-graded</p>
            <p className="mt-1.5 text-sm font-bold leading-snug">{a.title}</p>
            <p className="mt-1.5 whitespace-pre-wrap text-[11px] opacity-80 line-clamp-4">{a.instructions}</p>
            {token && (
              grade ? (
                <span className="sn-done mt-2">
                  <Check size={12} /> Graded {grade.percent}% (+{earned} XP)
                </span>
              ) : doneActivities.has(a._id) ? (
                <span className="sn-btn mt-2 inline-flex cursor-default items-center gap-1 opacity-80">
                  <Check size={12} /> Submitted — awaiting grade
                </span>
              ) : (
                <button onClick={() => markActivity(a._id)} className="sn-btn mt-2 inline-flex items-center gap-1">
                  <Check size={12} /> Submit for grading
                </button>
              )
            )}
          </div>
          );
        })}
      </div>

      <h1 className="mt-6 text-xl font-black">Quizzes</h1>
      <div className="mt-2 space-y-2">
        {quizzes?.map((q) => (
          <div key={q._id} className="rounded-2xl border bg-white p-4">
            <p className="font-bold">{q.title}</p>
            {q.description && <p className="text-sm text-slate-600">{q.description}</p>}
            <p className="text-xs text-slate-500">1 pt each · {q.points} XP pool · +20% for a perfect run</p>
            <QuizTaker quizId={q._id} token={token} />
          </div>
        ))}
        {quizzes?.length === 0 && <p className="text-sm text-slate-500">No quiz for this day yet.</p>}
      </div>
    </main>
  );
}

const SN = ["sn-yellow", "sn-pink", "sn-blue", "sn-green", "sn-orange"];

function LectureFile({ fileId, fileName }: { fileId: string; fileName: string }) {
  const url = useQuery((api as any)?.content?.getFileUrl, { fileId: fileId as any }) as string | null | undefined;
  if (!url)
    return (
      <span className="inline-flex items-center gap-1">
        <Paperclip size={11} /> {fileName}
      </span>
    );
  return (
    <a href={url} target="_blank" className="sn-link inline-flex items-center gap-0.5">
      <Paperclip size={11} /> {fileName} <ExternalLink size={11} />
    </a>
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
          <p className="text-sm font-bold">{qi + 1}. {q.prompt}</p>
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
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[11px] font-black text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  {String.fromCharCode(65 + ci)}
                </span>
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
        <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
          <Check size={15} /> Score: {result.score}/{result.total} • +{result.xp} XP
        </p>
      )}
    </div>
  );
}
