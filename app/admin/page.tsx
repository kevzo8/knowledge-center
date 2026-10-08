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
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ dayNo: (days?.length ?? 20) + 1, week: 4, date: "", title: "", summary: "" });

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-bold">Days ({days?.length ?? "…"}) — click a day to edit its lectures</h2>
        <button onClick={() => setAdding(!adding)} className="ml-auto rounded-full border px-4 py-1.5 text-sm font-bold">
          {adding ? "Cancel" : "+ Add day"}
        </button>
      </div>
      {adding && (
        <div className="grid gap-2 rounded-2xl border bg-white p-4 text-sm sm:grid-cols-3">
          <input type="number" className="rounded-xl border px-3 py-2" placeholder="dayNo" value={form.dayNo} onChange={(e) => setForm({ ...form, dayNo: Number(e.target.value) })} />
          <input type="number" className="rounded-xl border px-3 py-2" placeholder="week" value={form.week} onChange={(e) => setForm({ ...form, week: Number(e.target.value) })} />
          <input className="rounded-xl border px-3 py-2" placeholder="date e.g. Oct 31 Mon" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-xl border px-3 py-2" placeholder="summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <button
            onClick={async () => {
              await (upsertDay as any)({ token, ...form, date: form.date || undefined });
              setAdding(false);
              setForm({ dayNo: form.dayNo + 1, week: form.week, date: "", title: "", summary: "" });
            }}
            className="btn-primary rounded-xl py-2 font-bold sm:col-span-3"
          >
            Create day
          </button>
        </div>
      )}
      {!days && <p className="text-sm text-slate-500">Loading…</p>}
      {days?.map((d) => (
        <DayCard key={d._id} token={token} day={d} />
      ))}
    </section>
  );
}

function DayCard({ token, day }: { token: string; day: any }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingLec, setAddingLec] = useState(false);
  const upsertDay = useMutation((api as any)?.content?.upsertDay);
  const lectures = useQuery(
    (api as any)?.content?.listLectures,
    open ? { dayId: day._id } : "skip"
  ) as any[] | undefined;
  const [form, setForm] = useState({ dayNo: day.dayNo, week: day.week ?? 1, date: day.date ?? "", title: day.title, summary: day.summary ?? "", active: day.active });

  return (
    <div className={`rounded-2xl border bg-white ${day.active ? "" : "opacity-60"}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <span className="text-slate-400">{open ? "▾" : "▸"}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">
            Day {day.dayNo}{day.week ? ` • W${day.week}` : ""}{day.date ? ` • ${day.date}` : ""} — {day.title}
          </span>
          <span className="block text-xs text-slate-500">
            {open ? (lectures ? `${lectures.length} lecture(s) — click one to edit / upload` : "loading lectures…") : "click to expand"}
            {!day.active && " • HIDDEN"}
          </span>
        </span>
      </button>

      {open && (
        <div className="border-t px-4 py-3">
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="rounded-full border px-3 py-1 text-xs font-bold">
              {editing ? "Close" : "Edit day"}
            </button>
            <button
              onClick={async () => {
                await (upsertDay as any)({ token, dayId: day._id, dayNo: day.dayNo, week: day.week, date: day.date, title: day.title, summary: day.summary, active: !day.active });
              }}
              className="rounded-full border px-3 py-1 text-xs"
            >
              {day.active ? "Hide" : "Show"}
            </button>
            <button onClick={() => setAddingLec(!addingLec)} className="rounded-full border px-3 py-1 text-xs font-bold">
              {addingLec ? "Cancel" : "+ Lecture"}
            </button>
          </div>

          {editing && (
            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
              <input type="number" className="rounded-xl border px-3 py-2" value={form.dayNo} onChange={(e) => setForm({ ...form, dayNo: Number(e.target.value) })} />
              <input type="number" className="rounded-xl border px-3 py-2" value={form.week} onChange={(e) => setForm({ ...form, week: Number(e.target.value) })} />
              <input className="rounded-xl border px-3 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="date" />
              <input className="rounded-xl border px-3 py-2 sm:col-span-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="title" />
              <input className="rounded-xl border px-3 py-2" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="summary" />
              <button
                onClick={async () => {
                  await (upsertDay as any)({ token, dayId: day._id, ...form, date: form.date || undefined, active: day.active });
                  setEditing(false);
                }}
                className="btn-primary rounded-xl py-2 font-bold sm:col-span-3"
              >
                Save day
              </button>
            </div>
          )}

          {addingLec && <LectureForm token={token} dayId={day._id} nextOrder={(lectures?.length ?? 0) + 1} onDone={() => setAddingLec(false)} />}

          <div className="mt-2 space-y-2">
            {lectures?.map((l) => (
              <LectureRow key={l._id} token={token} lecture={l} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LectureForm({ token, dayId, lecture, nextOrder, onDone }: { token: string; dayId: string; lecture?: any; nextOrder: number; onDone: () => void }) {
  const upsertLecture = useMutation((api as any)?.content?.upsertLecture);
  const [f, setF] = useState({
    title: lecture?.title ?? "",
    kind: lecture?.kind ?? "slides",
    url: lecture?.url ?? "",
    fileName: lecture?.fileName ?? "",
    notes: lecture?.notes ?? "",
    order: lecture?.order ?? nextOrder,
  });
  const [saving, setSaving] = useState(false);

  return (
    <div className="mt-2 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
      <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <select className="rounded-xl border px-3 py-2" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
        <option value="slides">slides</option>
        <option value="link">link</option>
        <option value="doc">doc</option>
        <option value="video">video</option>
      </select>
      <input type="number" className="rounded-xl border px-3 py-2" placeholder="order" value={f.order} onChange={(e) => setF({ ...f, order: Number(e.target.value) })} />
      <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="URL (Google Slides / SharePoint / video)" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
      <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder="notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      <button
        disabled={saving || !f.title.trim()}
        onClick={async () => {
          setSaving(true);
          await (upsertLecture as any)({
            token,
            lectureId: lecture?._id,
            dayId: dayId as any,
            title: f.title.trim(),
            kind: f.kind as any,
            url: f.url.trim() || undefined,
            fileName: f.fileName || lecture?.fileName || undefined,
            notes: f.notes.trim() || undefined,
            order: f.order,
          });
          setSaving(false);
          onDone();
        }}
        className="btn-primary rounded-xl py-2 font-bold sm:col-span-2 disabled:opacity-50"
      >
        {saving ? "Saving…" : lecture ? "Save lecture" : "Add lecture"}
      </button>
    </div>
  );
}

function LectureRow({ token, lecture }: { token: string; lecture: any }) {
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const deleteLecture = useMutation((api as any)?.content?.deleteLecture);
  const genUrl = useMutation((api as any)?.content?.generateUploadUrl);
  const attach = useMutation((api as any)?.content?.attachFileToLecture);

  async function upload(file: File) {
    setUploading(true);
    setMsg("");
    try {
      const url = await (genUrl as any)({ token });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const { storageId } = await res.json();
      await (attach as any)({ token, lectureId: lecture._id, fileId: storageId, fileName: file.name });
      setMsg("Uploaded ✅");
    } catch (e: any) {
      setMsg(e?.message ?? "Upload failed");
    }
    setUploading(false);
  }

  return (
    <div className="rounded-xl border px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase">{lecture.kind}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold">{lecture.title}</span>
        <button onClick={() => setEditing(!editing)} className="rounded-full border px-2.5 py-1 text-xs font-bold">
          {editing ? "Close" : "Edit"}
        </button>
        <button
          onClick={async () => {
            if (confirm(`Delete "${lecture.title}"?`)) await (deleteLecture as any)({ token, lectureId: lecture._id });
          }}
          className="rounded-full border px-2.5 py-1 text-xs text-red-600"
        >
          Delete
        </button>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
        {lecture.url && <a href={lecture.url} target="_blank" className="text-indigo-600 underline">Open link ↗</a>}
        {lecture.fileId && <StoredFileLink fileId={lecture.fileId} fileName={lecture.fileName ?? "file"} />}
        {!lecture.fileId && lecture.fileName && <span className="text-slate-500">📎 {lecture.fileName} (not uploaded yet)</span>}
        {lecture.notes && <span className="text-slate-500">• {lecture.notes}</span>}
      </div>
      <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs font-bold text-indigo-700">
        <span className="rounded-full border border-indigo-300 px-3 py-1">
          {uploading ? "Uploading…" : lecture.fileId ? "↻ Replace file" : "⬆ Upload file"}
        </span>
        <input
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        {msg && <span className="font-normal text-slate-500">{msg}</span>}
      </label>
      {editing && (
        <LectureForm token={token} dayId={lecture.dayId} lecture={lecture} nextOrder={lecture.order} onDone={() => setEditing(false)} />
      )}
    </div>
  );
}

function StoredFileLink({ fileId, fileName }: { fileId: string; fileName: string }) {
  const url = useQuery((api as any)?.content?.getFileUrl, { fileId: fileId as any }) as string | null | undefined;
  if (!url) return <span className="text-slate-500">📎 {fileName}…</span>;
  return <a href={url} target="_blank" className="text-indigo-600 underline">📎 {fileName} ↗</a>;
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
