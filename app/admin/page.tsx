"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMe } from "../../lib/useMe";
import { useState } from "react";

export default function Admin() {
  const { token, me, loading } = useMe();
  const [tab, setTab] = useState<"users" | "days" | "quiz">("users");

  if (loading) return <p className="p-10 text-center text-sm">Loading…</p>;
  if (!token || !me)
    return (
      <main className="p-10 text-center">
        Not logged in. <a href="/login" className="underline">Login</a>
      </main>
    );
  if (me.role !== "admin" && me.role !== "trainer")
    return <main className="p-10 text-center">Trainers/admins only.</main>;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black">Admin <span className="text-sm font-normal text-slate-500">({me.displayName} • {me.role})</span></h1>
        <a href="/dashboard" className="ml-auto rounded-full border px-4 py-2 text-sm">← Dashboard</a>
      </div>
      <div className="mt-4 flex gap-2">
        {(["users", "days", "quiz"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${tab === t ? "bg-slate-900 text-white" : "border"}`}
          >
            {t === "users" ? "Users" : t === "days" ? "Days & lectures" : "Activities & quizzes"}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "users" && me.role === "admin" && <UsersPanel token={token} />}
        {tab === "users" && me.role !== "admin" && <p className="text-sm">Only admins manage users.</p>}
        {tab === "days" && <DaysPanel token={token} />}
        {tab === "quiz" && <QuizPanel token={token} />}
      </div>
    </main>
  );
}

function UsersPanel({ token }: { token: string }) {
  const users = useQuery((api as any)?.auth?.listUsers, { token }) as any[] | undefined;
  const createUser = useMutation((api as any)?.auth?.createUser);
  const resetPw = useMutation((api as any)?.auth?.resetPassword);
  const setActive = useMutation((api as any)?.auth?.setActive);
  const [form, setForm] = useState({ username: "", password: "", role: "trainee", displayName: "" });
  const [msg, setMsg] = useState("");

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">Create account</h2>
        <div className="mt-2 space-y-2 text-sm">
          <input className="w-full rounded-xl border px-3 py-2" placeholder="username e.g. maria.trainee" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="w-full rounded-xl border px-3 py-2" placeholder="display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          <input className="w-full rounded-xl border px-3 py-2" placeholder="temp password (min 4)" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="w-full rounded-xl border px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="trainee">trainee</option>
            <option value="trainer">trainer</option>
            <option value="admin">admin</option>
          </select>
          <button
            onClick={async () => {
              try {
                await (createUser as any)({ token, ...form });
                setMsg("Created ✅");
                setForm({ username: "", password: "", role: "trainee", displayName: "" });
              } catch (e: any) {
                setMsg(e.message ?? "Error");
              }
            }}
            className="w-full rounded-xl bg-slate-900 py-2 font-bold text-white"
          >
            Create
          </button>
          {msg && <p className="text-xs">{msg}</p>}
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">Accounts ({users?.length ?? "…"})</h2>
        <div className="mt-2 max-h-96 space-y-1.5 overflow-auto text-sm">
          {users?.map((u) => (
            <div key={u.username} className="flex items-center gap-2 rounded-xl border px-2 py-1.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{u.displayName} <span className="font-normal text-slate-500">@{u.username}</span></p>
                <p className="text-xs text-slate-500">{u.role} • {u.active ? "active" : "disabled"}</p>
              </div>
              <button
                onClick={async () => {
                  const np = prompt(`New password for ${u.username} (min 4):`);
                  if (np) await (resetPw as any)({ token, username: u.username, newPassword: np });
                }}
                className="rounded-full border px-2 py-1 text-xs"
              >
                Reset pw
              </button>
              <button
                onClick={async () => await (setActive as any)({ token, username: u.username, active: !u.active })}
                className="rounded-full border px-2 py-1 text-xs"
              >
                {u.active ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DaysPanel({ token }: { token: string }) {
  const days = useQuery((api as any)?.content?.listDaysAdmin, { token }) as any[] | undefined;
  const upsertDay = useMutation((api as any)?.content?.upsertDay);
  const upsertLecture = useMutation((api as any)?.content?.upsertLecture);
  const [dayForm, setDayForm] = useState({ dayNo: 21, week: 4, date: "", title: "", summary: "" });
  const [lecForm, setLecForm] = useState({ dayId: "", title: "", kind: "slides", url: "", fileName: "", notes: "", order: 1 });

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">Days ({days?.length ?? "…"})</h2>
        <div className="mt-2 space-y-1 text-sm">
          {days?.map((d) => (
            <div key={d._id} className="rounded-xl border px-3 py-2">
              <p className="font-bold">Day {d.dayNo}{d.week ? ` (W${d.week})` : ""}{d.date ? ` — ${d.date}` : ""} — {d.title}</p>
              <p className="text-xs text-slate-500">{d._id}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <input type="number" className="rounded-xl border px-3 py-2" placeholder="dayNo" value={dayForm.dayNo} onChange={(e) => setDayForm({ ...dayForm, dayNo: Number(e.target.value) })} />
          <input type="number" className="rounded-xl border px-3 py-2" placeholder="week" value={dayForm.week} onChange={(e) => setDayForm({ ...dayForm, week: Number(e.target.value) })} />
          <input className="rounded-xl border px-3 py-2" placeholder="date e.g. Oct 31 Mon" value={dayForm.date} onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })} />
          <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="title" value={dayForm.title} onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })} />
          <input className="rounded-xl border px-3 py-2" placeholder="summary" value={dayForm.summary} onChange={(e) => setDayForm({ ...dayForm, summary: e.target.value })} />
          <button
            onClick={async () => {
              await (upsertDay as any)({ token, ...dayForm, date: dayForm.date || undefined });
              setDayForm({ dayNo: dayForm.dayNo + 1, week: dayForm.week, date: "", title: "", summary: "" });
            }}
            className="rounded-xl bg-slate-900 py-2 font-bold text-white"
          >
            Add day
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">Add lecture / link</h2>
        <p className="text-xs text-slate-500">Paste a day _id from above. kind: slides | link | doc | video.</p>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2" placeholder="dayId" value={lecForm.dayId} onChange={(e) => setLecForm({ ...lecForm, dayId: e.target.value })} />
          <input className="rounded-xl border px-3 py-2" placeholder="title" value={lecForm.title} onChange={(e) => setLecForm({ ...lecForm, title: e.target.value })} />
          <select className="rounded-xl border px-3 py-2" value={lecForm.kind} onChange={(e) => setLecForm({ ...lecForm, kind: e.target.value })}>
            <option value="slides">slides</option>
            <option value="link">link</option>
            <option value="doc">doc</option>
            <option value="video">video</option>
          </select>
          <input type="number" className="rounded-xl border px-3 py-2" placeholder="order" value={lecForm.order} onChange={(e) => setLecForm({ ...lecForm, order: Number(e.target.value) })} />
          <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="url (Google Slides / SharePoint)" value={lecForm.url} onChange={(e) => setLecForm({ ...lecForm, url: e.target.value })} />
          <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="fileName (e.g. Flowcharting.pptx)" value={lecForm.fileName} onChange={(e) => setLecForm({ ...lecForm, fileName: e.target.value })} />
          <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="notes" value={lecForm.notes} onChange={(e) => setLecForm({ ...lecForm, notes: e.target.value })} />
          <button
            onClick={async () => {
              await (upsertLecture as any)({
                token,
                dayId: lecForm.dayId as any,
                title: lecForm.title,
                kind: lecForm.kind as any,
                url: lecForm.url || undefined,
                fileName: lecForm.fileName || undefined,
                notes: lecForm.notes || undefined,
                order: lecForm.order,
              });
              setLecForm({ dayId: lecForm.dayId, title: "", kind: "slides", url: "", fileName: "", notes: "", order: lecForm.order + 1 });
            }}
            className="rounded-xl bg-indigo-600 py-2 font-bold text-white sm:col-span-2"
          >
            Add lecture
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          File uploads: use Convex dashboard → Storage for now, then paste URL. Direct in-app upload comes next.
        </p>
      </div>
    </section>
  );
}

function QuizPanel({ token }: { token: string }) {
  const quizzes = useQuery((api as any)?.quizzes?.listQuizzes, {}) as any[] | undefined;
  const upsertQuiz = useMutation((api as any)?.quizzes?.upsertQuiz);
  const upsertQuestion = useMutation((api as any)?.quizzes?.upsertQuestion);
  const [qForm, setQForm] = useState({ title: "", description: "", points: 100 });
  const [qq, setQq] = useState({ quizId: "", prompt: "", choices: "", answerIndex: 0, points: 25, order: 1 });

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">Quizzes ({quizzes?.length ?? "…"})</h2>
        <div className="mt-2 space-y-1 text-sm">
          {quizzes?.map((q) => (
            <div key={q._id} className="rounded-xl border px-3 py-2">
              <p className="font-bold">{q.title}</p>
              <p className="text-xs text-slate-500">{q._id} • {q.points} pts • {q.active ? "active" : "hidden"}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <input className="rounded-xl border px-3 py-2" placeholder="quiz title" value={qForm.title} onChange={(e) => setQForm({ ...qForm, title: e.target.value })} />
          <input className="rounded-xl border px-3 py-2" placeholder="description" value={qForm.description} onChange={(e) => setQForm({ ...qForm, description: e.target.value })} />
          <button
            onClick={async () => {
              await (upsertQuiz as any)({ token, ...qForm });
              setQForm({ title: "", description: "", points: 100 });
            }}
            className="rounded-xl bg-slate-900 py-2 font-bold text-white"
          >
            Add quiz
          </button>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">Add question</h2>
        <p className="text-xs text-slate-500">choices = comma-separated. answerIndex = 0-based.</p>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="quizId" value={qq.quizId} onChange={(e) => setQq({ ...qq, quizId: e.target.value })} />
          <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="prompt" value={qq.prompt} onChange={(e) => setQq({ ...qq, prompt: e.target.value })} />
          <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="choices: A, B, C, D" value={qq.choices} onChange={(e) => setQq({ ...qq, choices: e.target.value })} />
          <input type="number" className="rounded-xl border px-3 py-2" placeholder="answerIndex" value={qq.answerIndex} onChange={(e) => setQq({ ...qq, answerIndex: Number(e.target.value) })} />
          <input type="number" className="rounded-xl border px-3 py-2" placeholder="order" value={qq.order} onChange={(e) => setQq({ ...qq, order: Number(e.target.value) })} />
          <button
            onClick={async () => {
              await (upsertQuestion as any)({
                token,
                quizId: qq.quizId as any,
                prompt: qq.prompt,
                choices: qq.choices.split(",").map((s) => s.trim()).filter(Boolean),
                answerIndex: qq.answerIndex,
                points: qq.points,
                order: qq.order,
              });
              setQq({ ...qq, prompt: "", choices: "", order: qq.order + 1 });
            }}
            className="rounded-xl bg-indigo-600 py-2 font-bold text-white sm:col-span-2"
          >
            Add question
          </button>
        </div>
      </div>
    </section>
  );
}
