"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMe } from "../../lib/useMe";
import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "../../components/ThemeToggle";
import { Check, ChevronDown, ChevronRight, ExternalLink, Paperclip, RefreshCw, Upload } from "lucide-react";

export default function Admin() {
  const { token, me, loading } = useMe();
  const [tab, setTab] = useState<"users" | "days" | "activities" | "quiz" | "overview" | "grading">("users");

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
        <Link href="/" title="Home">
          <img
            src="/svi_logo.png"
            alt="SVI home"
            className="h-11 w-11 shrink-0 rounded-2xl bg-white object-contain p-1 shadow-md transition hover:scale-105"
          />
        </Link>
        <h1 className="text-2xl font-black">Admin <span className="text-sm font-normal text-slate-500">({me.displayName} • {me.role})</span></h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <a href="/dashboard" className="rounded-full border px-4 py-2 text-sm">← Dashboard</a>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["users", "days", "activities", "quiz", "overview", "grading"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${tab === t ? "btn-primary" : "border"}`}
          >
            {t === "users" ? "Users" : t === "days" ? "Days & lectures" : t === "activities" ? "Activities" : t === "quiz" ? "Quizzes" : t === "overview" ? "Trainees" : "Grading"}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "users" && me.role === "admin" && <UsersPanel token={token} />}
        {tab === "users" && me.role !== "admin" && <p className="text-sm">Only admins manage users.</p>}
        {tab === "days" && <DaysPanel token={token} />}
        {tab === "activities" && <ActivitiesPanel token={token} />}
        {tab === "quiz" && <QuizPanel token={token} />}
        {tab === "overview" && <OverviewPanel token={token} isAdmin={me.role === "admin"} />}
        {tab === "grading" && <GradingPanel token={token} meUsername={me.username} />}
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
                setMsg("Created");
                setForm({ username: "", password: "", role: "trainee", displayName: "" });
              } catch (e: any) {
                setMsg(e.message ?? "Error");
              }
            }}
            className="w-full btn-primary rounded-xl py-2 font-bold"
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
        <span className="text-slate-400">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
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
      setMsg("Uploaded");
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
        {lecture.url && <a href={lecture.url} target="_blank" className="inline-flex items-center gap-0.5 text-indigo-600 underline">Open link <ExternalLink size={11} /></a>}
        {lecture.fileId && <StoredFileLink fileId={lecture.fileId} fileName={lecture.fileName ?? "file"} />}
        {!lecture.fileId && lecture.fileName && <span className="inline-flex items-center gap-1 text-slate-500"><Paperclip size={11} /> {lecture.fileName} (not uploaded yet)</span>}
        {lecture.notes && <span className="text-slate-500">• {lecture.notes}</span>}
      </div>
      <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs font-bold text-indigo-700">
        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-300 px-3 py-1">
          {uploading ? "Uploading…" : lecture.fileId ? (<><RefreshCw size={12} /> Replace file</>) : (<><Upload size={12} /> Upload file</>)}
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
        {msg && <span className="inline-flex items-center gap-1 font-normal text-slate-500">{msg === "Uploaded" && <Check size={12} />}{msg}</span>}
      </label>
      {editing && (
        <LectureForm token={token} dayId={lecture.dayId} lecture={lecture} nextOrder={lecture.order} onDone={() => setEditing(false)} />
      )}
    </div>
  );
}

function StoredFileLink({ fileId, fileName }: { fileId: string; fileName: string }) {
  const url = useQuery((api as any)?.content?.getFileUrl, { fileId: fileId as any }) as string | null | undefined;
  if (!url)
    return (
      <span className="inline-flex items-center gap-1 text-slate-500">
        <Paperclip size={11} /> {fileName}…
      </span>
    );
  return (
    <a href={url} target="_blank" className="inline-flex items-center gap-0.5 text-indigo-600 underline">
      <Paperclip size={11} /> {fileName} <ExternalLink size={11} />
    </a>
  );
}

function ActivityAdminRow({ token, activity, dayName }: { token: string; activity: any; dayName: string }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const roster = useQuery(
    (api as any)?.content?.activityRoster,
    open ? { token, activityId: activity._id } : "skip"
  ) as any[] | undefined;
  const upsertActivity = useMutation((api as any)?.content?.upsertActivity);
  const deleteActivity = useMutation((api as any)?.content?.deleteActivity);
  const [f, setF] = useState({ title: activity.title, instructions: activity.instructions, points: activity.points, order: activity.order });

  return (
    <div className="rounded-xl border px-3 py-2">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left text-sm">
        <span className="text-slate-400">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
        <span className="min-w-0 flex-1">
          <span className="font-bold">{activity.title}</span>{" "}
          <span className="text-xs text-slate-500">{dayName} • +{activity.points} XP{roster ? ` • ${roster.length} done` : ""}</span>
        </span>
      </button>
      {open && (
        <div className="mt-2 border-t pt-2 text-sm">
          <p className="whitespace-pre-wrap text-slate-600">{activity.instructions}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Completed by ({roster?.length ?? "…"})
          </p>
          {!roster && <p className="text-xs text-slate-500">Loading…</p>}
          {roster?.length === 0 && <p className="text-xs text-slate-500">Nobody yet.</p>}
          {roster?.map((r, i) => (
            <p key={`${r.username}-${r.at}-${i}`} className="text-xs">
              <span className="font-bold">{r.displayName}</span>{" "}
              <span className="font-mono text-slate-500">@{r.username} • {new Date(r.at).toLocaleDateString()}</span>
            </p>
          ))}
          <div className="mt-2 flex gap-1.5">
            <button onClick={() => setEditing(!editing)} className="rounded-full border px-3 py-1 text-xs font-bold">
              {editing ? "Close" : "Edit"}
            </button>
            <button
              onClick={async () => {
                if (confirm(`Delete "${activity.title}"? Completions stay in history.`))
                  await (deleteActivity as any)({ token, activityId: activity._id });
              }}
              className="rounded-full border px-3 py-1 text-xs text-red-600"
            >
              Delete
            </button>
          </div>
          {editing && (
            <div className="mt-2 grid gap-1.5 text-sm">
              <input className="rounded-xl border px-3 py-2" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="title" />
              <textarea className="rounded-xl border px-3 py-2" value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} placeholder="instructions" />
              <div className="grid grid-cols-2 gap-1.5">
                <label className="text-xs">XP points
                  <input type="number" min={0} className="mt-0.5 w-full rounded-xl border px-3 py-2" value={f.points} onChange={(e) => setF({ ...f, points: Number(e.target.value) })} />
                </label>
                <label className="text-xs">Order
                  <input type="number" className="mt-0.5 w-full rounded-xl border px-3 py-2" value={f.order} onChange={(e) => setF({ ...f, order: Number(e.target.value) })} />
                </label>
              </div>
              <button
                onClick={async () => {
                  await (upsertActivity as any)({ token, activityId: activity._id, dayId: activity.dayId, ...f });
                  setEditing(false);
                }}
                className="btn-primary rounded-xl py-2 font-bold"
              >
                Save activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActivitiesPanel({ token }: { token: string }) {
  const days = useQuery((api as any)?.content?.listDaysAdmin, { token }) as any[] | undefined;
  const all = useQuery((api as any)?.content?.listActivities, {}) as any[] | undefined;
  const upsertActivity = useMutation((api as any)?.content?.upsertActivity);
  const [dayFilter, setDayFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ dayId: "", title: "", instructions: "", points: 20, order: 1 });
  const dayName = (id: string) => {
    const d = days?.find((x) => String(x._id) === String(id));
    return d ? `Day ${d.dayNo}` : "No day";
  };
  const list = (all ?? []).filter((a) => !dayFilter || String(a.dayId) === dayFilter);

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="font-bold">Activities ({list.length}) — click to see who completed</h2>
        <select className="ml-auto rounded-full border px-3 py-1.5 text-xs" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
          <option value="">All days</option>
          {days?.map((d) => (
            <option key={String(d._id)} value={String(d._id)}>Day {d.dayNo}</option>
          ))}
        </select>
        <button onClick={() => setAdding(!adding)} className="rounded-full border px-3 py-1.5 text-xs font-bold">
          {adding ? "Cancel" : "+ Activity"}
        </button>
      </div>
      {adding && (
        <div className="grid gap-1.5 rounded-2xl border bg-white p-4 text-sm">
          <div className="grid gap-1.5 sm:grid-cols-2">
            <select className="rounded-xl border px-3 py-2" value={form.dayId} onChange={(e) => setForm({ ...form, dayId: e.target.value })}>
              <option value="">No day</option>
              {days?.map((d) => (
                <option key={String(d._id)} value={String(d._id)}>Day {d.dayNo} — {d.title.slice(0, 40)}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="number" min={0} className="rounded-xl border px-3 py-2" placeholder="XP" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
              <input type="number" className="rounded-xl border px-3 py-2" placeholder="order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
          </div>
          <input className="rounded-xl border px-3 py-2" placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="rounded-xl border px-3 py-2" placeholder="instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          <button
            onClick={async () => {
              await (upsertActivity as any)({ token, dayId: form.dayId ? (form.dayId as any) : undefined, title: form.title, instructions: form.instructions, points: form.points, order: form.order });
              setAdding(false);
              setForm({ dayId: form.dayId, title: "", instructions: "", points: 20, order: form.order + 1 });
            }}
            className="btn-primary rounded-xl py-2 font-bold"
          >
            Add activity
          </button>
        </div>
      )}
      {!all && <p className="text-sm text-slate-500">Loading…</p>}
      {list.map((a) => (
        <ActivityAdminRow key={String(a._id)} token={token} activity={a} dayName={dayName(String(a.dayId))} />
      ))}
    </section>
  );
}

function QuizPanel({ token }: { token: string }) {
  const quizzes = useQuery((api as any)?.quizzes?.listQuizzes, {}) as any[] | undefined;
  const upsertQuiz = useMutation((api as any)?.quizzes?.upsertQuiz);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", points: 100 });

  return (
    <section className="space-y-2">
      <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600">
        <b>Quizzes</b> are auto-graded multiple choice — trainees answer, scores and XP land instantly.
        Click a quiz to see its questions, edit them, or add more. No IDs needed.
      </div>
      <div className="flex items-center gap-2">
        <h2 className="font-bold">Quizzes ({quizzes?.length ?? "…"})</h2>
        <button onClick={() => setAdding(!adding)} className="ml-auto rounded-full border px-3 py-1.5 text-xs font-bold">
          {adding ? "Cancel" : "+ Quiz"}
        </button>
      </div>
      {adding && (
        <div className="grid gap-1.5 rounded-2xl border bg-white p-4 text-sm sm:grid-cols-3">
          <input className="rounded-xl border px-3 py-2" placeholder="quiz title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-xl border px-3 py-2" placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button
            onClick={async () => {
              await (upsertQuiz as any)({ token, ...form });
              setAdding(false);
              setForm({ title: "", description: "", points: 100 });
            }}
            className="btn-primary rounded-xl py-2 font-bold"
          >
            Add quiz
          </button>
        </div>
      )}
      {!quizzes && <p className="text-sm text-slate-500">Loading…</p>}
      {quizzes?.map((q) => (
        <QuizCard key={String(q._id)} token={token} quiz={q} />
      ))}
    </section>
  );
}

function QuizCard({ token, quiz }: { token: string; quiz: any }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingQ, setAddingQ] = useState(false);
  const full = useQuery(
    (api as any)?.quizzes?.getQuiz,
    open ? { quizId: quiz._id, includeAnswers: true } : "skip"
  ) as any;
  const upsertQuiz = useMutation((api as any)?.quizzes?.upsertQuiz);
  const deleteQuiz = useMutation((api as any)?.quizzes?.deleteQuiz);
  const [f, setF] = useState({ title: quiz.title, description: quiz.description ?? "", points: quiz.points, active: quiz.active });
  const questions = full?.questions ?? [];

  return (
    <div className={`rounded-2xl border bg-white ${quiz.active ? "" : "opacity-60"}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <span className="text-slate-400">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{quiz.title}</span>
          <span className="block text-xs text-slate-500">
            {open ? (full ? `${questions.length} question(s) — click one to edit` : "loading…") : "click to view questions"}
            {!quiz.active && " • HIDDEN"}
          </span>
        </span>
      </button>
      {open && (
        <div className="border-t px-4 py-3">
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="rounded-full border px-3 py-1 text-xs font-bold">
              {editing ? "Close" : "Edit quiz"}
            </button>
            <button
              onClick={async () => {
                if (confirm(`Delete quiz "${quiz.title}" and all its questions?`))
                  await (deleteQuiz as any)({ token, quizId: quiz._id });
              }}
              className="rounded-full border px-3 py-1 text-xs text-red-600"
            >
              Delete
            </button>
            <button onClick={() => setAddingQ(!addingQ)} className="rounded-full border px-3 py-1 text-xs font-bold">
              {addingQ ? "Cancel" : "+ Question"}
            </button>
          </div>
          {editing && (
            <div className="mt-2 grid gap-1.5 text-sm sm:grid-cols-3">
              <input className="rounded-xl border px-3 py-2" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="title" />
              <input className="rounded-xl border px-3 py-2" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="description" />
              <label className="text-xs">XP pool (100 = % becomes XP)
                <input type="number" min={1} className="mt-0.5 w-full rounded-xl border px-3 py-2" value={f.points} onChange={(e) => setF({ ...f, points: Number(e.target.value) })} />
              </label>
              <label className="flex items-center gap-2 text-xs sm:col-span-2">
                <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Visible to trainees
              </label>
              <button
                onClick={async () => {
                  await (upsertQuiz as any)({ token, quizId: quiz._id, ...f });
                  setEditing(false);
                }}
                className="btn-primary rounded-xl py-2 font-bold"
              >
                Save quiz
              </button>
            </div>
          )}
          {addingQ && (
            <QuestionForm token={token} quizId={String(quiz._id)} nextOrder={questions.length + 1} onDone={() => setAddingQ(false)} />
          )}
          <div className="mt-2 space-y-1.5">
            {questions.map((q: any) => (
              <QuestionRow key={String(q._id)} token={token} quizId={String(quiz._id)} q={q} />
            ))}
            {full && questions.length === 0 && <p className="text-xs text-slate-500">No questions yet — add one above.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionForm({ token, quizId, question, nextOrder, onDone }: { token: string; quizId: string; question?: any; nextOrder: number; onDone: () => void }) {
  const upsertQuestion = useMutation((api as any)?.quizzes?.upsertQuestion);
  const [prompt, setPrompt] = useState(question?.prompt ?? "");
  const [choices, setChoices] = useState<string>((question?.choices ?? []).join("\n"));
  const [answerIndex, setAnswerIndex] = useState(question?.answerIndex ?? 0);
  const [order, setOrder] = useState(question?.order ?? nextOrder);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const choiceList = choices.split("\n").map((s) => s.trim()).filter(Boolean);
  const letter = (i: number) => String.fromCharCode(65 + i);

  return (
    <div className="mt-2 grid gap-1.5 rounded-xl bg-slate-50 p-3 text-sm">
      <input className="rounded-xl border px-3 py-2" placeholder="Question prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <textarea className="rounded-xl border px-3 py-2" placeholder={"One choice per line,\ncommas are fine now"} value={choices} onChange={(e) => setChoices(e.target.value)} rows={4} />
      <div className="grid grid-cols-2 gap-1.5">
        <label className="text-xs">Correct answer
          <select
            className="mt-0.5 w-full rounded-xl border px-2 py-2 font-mono"
            value={Math.min(answerIndex, Math.max(0, choiceList.length - 1))}
            onChange={(e) => setAnswerIndex(Number(e.target.value))}
          >
            {choiceList.length === 0 && <option value={0}>Add choices first</option>}
            {choiceList.map((c, i) => (
              <option key={i} value={i}>
                {letter(i)} – {c.slice(0, 40)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">Order = position in quiz (unique)
          <input type="number" min={1} className="mt-0.5 w-full rounded-xl border px-2 py-2 text-center font-mono" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </label>
      </div>
      {choiceList.length > 0 && (
        <p className="text-xs text-slate-500">
          Correct answer: <b>{letter(Math.min(answerIndex, choiceList.length - 1))} – {choiceList[Math.min(answerIndex, choiceList.length - 1)]}</b>
        </p>
      )}
      {err && <p className="text-xs font-bold text-red-600">{err}</p>}
      <button
        disabled={saving || !prompt.trim() || choiceList.length < 2}
        onClick={async () => {
          setSaving(true);
          setErr("");
          try {
            await (upsertQuestion as any)({
              token, questionId: question?._id, quizId: quizId as any,
              prompt: prompt.trim(), choices: choiceList,
              answerIndex: Math.max(0, Math.min(choiceList.length - 1, answerIndex)),
              points: 1, order,
            });
            onDone();
          } catch (e: any) {
            setErr(e?.message ?? "Save failed");
          }
          setSaving(false);
        }}
        className="btn-primary rounded-xl py-2 font-bold disabled:opacity-50"
      >
        {saving ? "Saving…" : question ? "Save question" : "Add question"}
      </button>
    </div>
  );
}

function QuestionRow({ token, quizId, q }: { token: string; quizId: string; q: any }) {
  const [editing, setEditing] = useState(false);
  const deleteQuestion = useMutation((api as any)?.quizzes?.deleteQuestion);
  if (editing) {
    return <QuestionForm token={token} quizId={quizId} question={q} nextOrder={q.order} onDone={() => setEditing(false)} />;
  }
  return (
    <div className="rounded-xl border px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 font-bold">{q.prompt} <span className="font-normal text-slate-500">#{q.order}</span></span>
        <button onClick={() => setEditing(true)} className="rounded-full border px-2.5 py-1 text-xs font-bold">Edit</button>
        <button
          onClick={async () => {
            if (confirm("Delete this question?")) await (deleteQuestion as any)({ token, questionId: q._id });
          }}
          className="rounded-full border px-2.5 py-1 text-xs text-red-600"
        >
          Delete
        </button>
      </div>
      <ul className="mt-1 space-y-0.5 text-xs">
        {q.choices.map((c: string, i: number) => (
          <li key={i} className={`flex items-center gap-1.5 rounded-lg px-2 py-1 ${i === q.answerIndex ? "bg-emerald-100 font-bold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200" : "text-slate-500"}`}>
            {i === q.answerIndex ? <Check size={12} /> : <span className="w-3 text-center font-mono">{i}</span>}
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function gradeLetter(avg: number | null) {
  if (avg === null) return "—";
  if (avg >= 90) return "S";
  if (avg >= 80) return "A";
  if (avg >= 70) return "B";
  if (avg >= 60) return "C";
  return "D";
}

function TraineeRow({ token, row, isAdmin }: { token: string; row: any; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const grades = useQuery(
    (api as any)?.grading?.gradesForTrainee,
    open ? { token, username: row.username } : "skip"
  ) as any[] | undefined;
  const resetPw = useMutation((api as any)?.auth?.resetPassword);
  const setActive = useMutation((api as any)?.auth?.setActive);
  const grantBonus = useMutation((api as any)?.grading?.grantBonus);
  const [msg, setMsg] = useState("");
  const combined = [row.quizAvg, row.evalAvg].filter((v) => v !== null) as number[];
  const overall = combined.length ? Math.round(combined.reduce((s, v) => s + v, 0) / combined.length) : null;

  async function act(fn: () => Promise<any>, ok: string) {
    try {
      await fn();
      setMsg(ok);
    } catch (e: any) {
      setMsg(e?.message ?? "Error");
    }
  }

  return (
    <div className="rounded-xl border px-3 py-2">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left text-sm">
        <span className="text-slate-400">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
        <span className="min-w-0 flex-1">
          <span className="font-bold">{row.displayName}</span>{" "}
          <span className="font-mono text-xs text-slate-500">@{row.username} • Lv{row.level} • {row.totalXp} XP</span>
        </span>
        <span className="font-display text-base font-bold">{gradeLetter(overall)}</span>
        <span className="hidden text-xs text-slate-500 sm:inline">
          Q:{row.quizAvg !== null ? `${row.quizAvg}%` : "—"} P:{row.evalAvg !== null ? `${row.evalAvg}%` : "—"}
        </span>
      </button>
      {open && (
        <div className="mt-2 border-t pt-2 text-sm">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {[
              ["Lectures", `${row.lecturesDone} (${row.lectureXp} XP)`],
              ["Quizzes", `${row.quizzesTaken} taken${row.quizAvg !== null ? ` · avg ${row.quizAvg}%` : ""} (${row.quizXp} XP)`],
              ["Activities", `${row.activitiesDone} (${row.activityXp} XP)`],
              ["Panels", `${row.evalsGraded} graded${row.evalAvg !== null ? ` · avg ${row.evalAvg}%` : ""}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-slate-50 px-2 py-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{k}</p>
                <p className="font-bold">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Grades</p>
          {!grades && <p className="text-xs text-slate-500">Loading…</p>}
          {grades?.length === 0 && <p className="text-xs text-slate-500">Not graded yet — grade in the Grading tab.</p>}
          {grades?.map((g, i) => (
            <p key={i} className="text-xs">
              <span className="font-bold">{g.evaluationTitle}</span> — {g.percent}% <span className="text-slate-500">by {g.gradedBy}</span>
            </p>
          ))}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    const np = prompt(`New password for ${row.username} (min 4):`);
                    if (np) act(() => (resetPw as any)({ token, username: row.username, newPassword: np }), "Password reset");
                  }}
                  className="rounded-full border px-3 py-1 text-xs font-bold"
                >
                  Reset pw
                </button>
                <button
                  onClick={() =>
                    act(() => (setActive as any)({ token, username: row.username, active: false }), "Disabled — re-enable in Users tab")
                  }
                  className="rounded-full border px-3 py-1 text-xs"
                >
                  Disable
                </button>
              </>
            )}
            <button
              onClick={() => {
                const amt = prompt(`Bonus XP for ${row.username} (negative allowed, ±1000):`, "10");
                if (amt !== null && amt.trim() !== "")
                  act(() => (grantBonus as any)({ token, username: row.username, xp: Number(amt) }), `Adjusted ${amt} XP`);
              }}
              className="rounded-full border px-3 py-1 text-xs font-bold"
            >
              +/− XP
            </button>
          </div>
          {msg && <p className="mt-1 text-xs">{msg}</p>}
        </div>
      )}
    </div>
  );
}

function OverviewPanel({ token, isAdmin }: { token: string; isAdmin: boolean }) {
  const data = useQuery((api as any)?.grading?.traineeOverview, { token }) as
    | { rows: any[]; panels: any[] }
    | undefined;
  const rows: any[] = data?.rows ?? [];
  if (!data) return <p className="text-sm text-slate-500">Loading trainees…</p>;
  if (rows.length === 0) return <p className="text-sm text-slate-500">No trainees yet — create accounts in Users.</p>;
  return (
    <section className="rounded-2xl border bg-white p-4">
      <h2 className="font-bold">Trainees ({rows.length}) — click a row to manage</h2>
      <p className="text-xs text-slate-500">Full charts live on the staff dashboard. Here: details, grades, password resets, enable/disable, XP adjustments. Re-grade in the Grading tab (replaces old XP, never double-pays).</p>
      <div className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <TraineeRow key={r.username} token={token} row={r} isAdmin={isAdmin} />
        ))}
      </div>
    </section>
  );
}

function GradingPanel({ token, meUsername }: { token: string; meUsername: string }) {
  const evals = useQuery((api as any)?.grading?.listEvaluations, { token }) as any[] | undefined;
  const rubrics = useQuery((api as any)?.grading?.listRubrics, { token }) as any[] | undefined;
  const days = useQuery((api as any)?.content?.listDaysAdmin, { token }) as any[] | undefined;
  const activities = useQuery((api as any)?.content?.listActivities, {}) as any[] | undefined;
  const [evalId, setEvalId] = useState("");
  const picked = evals?.find((e) => String(e._id) === evalId) ?? evals?.[0];

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600">
        An <b>evaluation</b> is one thing you score — a game demo, a proposal, or an activity.
        It uses a <b>rubric</b> (the score sheet: categories → criteria → max scores) plus an <b>XP pool</b> —
        85% on a 100-XP pool earns 85 XP. Re-grading replaces the old XP.<br />
        The trainers scoring one trainee form its <b>panel</b> — each keeps their own ballot, the trainee
        earns the average and only ever sees them as Panel 1, Panel 2, …<br />
        <b>Rubrics are reusable templates:</b> right now the War Card demo and the Solitaire demo
        share the same “War Card & Solitaire” sheet — make a rubric once, attach it to many evaluations.
      </div>
      <EvalBuilder token={token} rubrics={rubrics} days={days} activities={activities} evals={evals} />
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">Grade trainees</h2>
        {!evals ? (
          <p className="mt-1 text-sm text-slate-500">Loading…</p>
        ) : evals.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500">No evaluations yet — create one above (War Card, Solitaire, Proposal are pre-seeded).</p>
        ) : (
          <div className="mt-2">
            <select className="w-full rounded-xl border px-3 py-2 text-sm" value={picked ? String(picked._id) : ""} onChange={(e) => setEvalId(e.target.value)}>
              {evals.map((e) => {
                const rn = rubrics?.find((r) => String(r._id) === String(e.rubricId))?.title ?? "?";
                return (
                  <option key={String(e._id)} value={String(e._id)}>
                    {e.title} • sheet: {rn} • {e.points} XP • {e.gradedCount} graded
                  </option>
                );
              })}
            </select>
            {picked && <GradeEntry key={String(picked._id)} token={token} evaluationId={String(picked._id)} meUsername={meUsername} />}
          </div>
        )}
      </div>
    </section>
  );
}

function RubricRow({ token, rubric, usage }: { token: string; rubric: any; usage: any[] }) {
  const [open, setOpen] = useState(false);
  const max = (rubric.items ?? []).reduce((s: number, it: any) => s + (it.maxScore || 0), 0);
  return (
    <div className="rounded-xl border px-3 py-2">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left text-sm">
        <span className="text-slate-400">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
        <span className="min-w-0 flex-1">
          <span className="font-bold">{rubric.title}</span>{" "}
          <span className="text-xs text-slate-500">
            {(rubric.items ?? []).length} criteria • /{max} • used by {usage.length} evaluation{usage.length === 1 ? "" : "s"}
          </span>
        </span>
      </button>
      {open && (
        <div className="mt-1.5 border-t pt-1.5 text-xs">
          {usage.length > 0 && (
            <p className="text-slate-500">Attached to: {usage.map((e) => e.title).join(" · ")}</p>
          )}
          {(rubric.items ?? []).map((it: any, i: number) => (
            <p key={i}>
              <span className="font-bold uppercase">{it.category}</span> — {it.criterion}{" "}
              <span className="font-mono text-slate-500">/{it.maxScore}</span>
            </p>
          ))}
          {rubric.description && <p className="mt-1 text-slate-500">{rubric.description}</p>}
        </div>
      )}
    </div>
  );
}

function EvalBuilder({ token, rubrics, days, activities, evals }: { token: string; rubrics: any[] | undefined; days: any[] | undefined; activities: any[] | undefined; evals: any[] | undefined }) {
  const upsertRubric = useMutation((api as any)?.grading?.upsertRubric);
  const upsertEvaluation = useMutation((api as any)?.grading?.upsertEvaluation);
  const [rTitle, setRTitle] = useState("");
  const [rLines, setRLines] = useState("Logic & Execution | Sound program logic | 10\nPresentation | Clear demo | 10");
  const [eTitle, setETitle] = useState("");
  const [eDay, setEDay] = useState("");
  const [eActivity, setEActivity] = useState("");
  const [eRubric, setERubric] = useState("");
  const [ePoints, setEPoints] = useState(100);
  const [msg, setMsg] = useState("");
  const [openR, setOpenR] = useState(false);
  const [openE, setOpenE] = useState(false);

  function parseItems() {
    return rLines
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [category, criterion, max] = l.split("|").map((s) => s.trim());
        return { category: category ?? "", criterion: criterion ?? "", maxScore: Number(max) };
      });
  }

  const rubricName = (id: string) => rubrics?.find((r) => String(r._id) === String(id))?.title ?? "?";
  const dayTag = (id?: string) => {
    const d = days?.find((x) => String(x._id) === String(id));
    return d ? `Day ${d.dayNo}` : null;
  };
  const actTag = (id?: string) => activities?.find((x) => String(x._id) === String(id))?.title.slice(0, 32) ?? null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Score sheets — rubrics ({rubrics?.length ?? "…"})</h2>
          <button onClick={() => setOpenR(!openR)} className="ml-auto rounded-full border px-3 py-1 text-xs font-bold">
            {openR ? "Close" : "+ New sheet"}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          A rubric is just the reusable score sheet — categories, criteria, max scores.
          Attach the same sheet to many evaluations.
        </p>
        <div className="mt-2 space-y-1.5">
          {rubrics?.map((r) => (
            <RubricRow key={String(r._id)} token={token} rubric={r} usage={evals?.filter((e) => String(e.rubricId) === String(r._id)) ?? []} />
          ))}
        </div>
        {openR && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-bold">New rubric — one criterion per line</p>
            <p className="font-mono text-[11px] text-slate-500">Category | Criterion | max score</p>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Rubric title" value={rTitle} onChange={(e) => setRTitle(e.target.value)} />
            <textarea className="mt-1 h-28 w-full rounded-xl border px-3 py-2 font-mono text-xs" value={rLines} onChange={(e) => setRLines(e.target.value)} />
            <button
              onClick={async () => {
                try {
                  await (upsertRubric as any)({ token, title: rTitle, items: parseItems() });
                  setRTitle("");
                  setMsg("Rubric saved");
                } catch (e: any) {
                  setMsg(e?.message ?? "Error");
                }
              }}
              className="btn-primary mt-1 w-full rounded-xl py-2 font-bold"
            >
              Save rubric
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Gradeable events — evaluations ({evals?.length ?? "…"})</h2>
          <button onClick={() => setOpenE(!openE)} className="ml-auto rounded-full border px-3 py-1 text-xs font-bold">
            {openE ? "Close" : "+ New event"}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          An evaluation is one thing you score — a game demo, a proposal, an activity.
          It borrows a sheet above and sets an XP pool: 85% of 100 = 85 XP.
        </p>
        <div className="mt-2 space-y-1.5">
          {evals?.map((e) => (
            <div key={String(e._id)} className="rounded-xl border px-3 py-2 text-sm">
              <p className="font-bold">{e.title}</p>
              <p className="text-xs text-slate-500">
                sheet: {rubricName(String(e.rubricId))} • {e.points} XP pool • {e.gradedCount} graded
                {dayTag(e.dayId ? String(e.dayId) : undefined) ? ` • ${dayTag(e.dayId ? String(e.dayId) : undefined)}` : ""}
                {actTag(e.activityId ? String(e.activityId) : undefined) ? ` • grades: ${actTag(e.activityId ? String(e.activityId) : undefined)}` : ""}
              </p>
            </div>
          ))}
        </div>
        {openE && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-bold">New evaluation</p>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Title e.g. Panel 2: polish check" value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={eActivity}
              onChange={(e) => {
                setEActivity(e.target.value);
                const a = activities?.find((x) => String(x._id) === e.target.value);
                if (a) {
                  setEPoints(a.points || 100);
                  if (!eTitle) setETitle(`Grade: ${a.title}`);
                }
              }}
            >
              <option value="">Grade an activity? pick one (fills XP pool)</option>
              {activities?.map((a) => (
                <option key={String(a._id)} value={String(a._id)}>{a.title.slice(0, 50)} (+{a.points})</option>
              ))}
            </select>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <select className="rounded-xl border px-3 py-2" value={eDay} onChange={(e) => setEDay(e.target.value)}>
                <option value="">No day</option>
                {days?.map((d) => (
                  <option key={String(d._id)} value={String(d._id)}>Day {d.dayNo} — {d.title.slice(0, 30)}</option>
                ))}
              </select>
              <select className="rounded-xl border px-3 py-2" value={eRubric} onChange={(e) => setERubric(e.target.value)}>
                <option value="">Pick sheet</option>
                {rubrics?.map((r) => (
                  <option key={String(r._id)} value={String(r._id)}>{r.title}</option>
                ))}
              </select>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <label className="text-xs">XP pool</label>
              <input type="number" className="w-24 rounded-xl border px-3 py-2" value={ePoints} onChange={(e) => setEPoints(Number(e.target.value))} />
              <button
                onClick={async () => {
                  try {
                    await (upsertEvaluation as any)({
                      token,
                      title: eTitle,
                      dayId: eDay ? (eDay as any) : undefined,
                      activityId: eActivity ? (eActivity as any) : undefined,
                      rubricId: eRubric as any,
                      points: ePoints,
                    });
                    setETitle("");
                    setEActivity("");
                    setMsg("Evaluation saved");
                  } catch (e: any) {
                    setMsg(e?.message ?? "Error");
                  }
                }}
                className="btn-primary flex-1 rounded-xl py-2 font-bold"
              >
                Save evaluation
              </button>
            </div>
            {msg && <p className="mt-1 text-xs">{msg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function GradeEntry({ token, evaluationId, meUsername }: { token: string; evaluationId: string; meUsername: string }) {
  const data = useQuery((api as any)?.grading?.gradesForEvaluation, { token, evaluationId: evaluationId as any }) as any;
  const gradeTrainee = useMutation((api as any)?.grading?.gradeTrainee);
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number[]>>({});
  const [msg, setMsg] = useState("");

  if (!data) return <p className="mt-2 text-sm text-slate-500">Loading roster…</p>;
  const items: { category: string; criterion: string; maxScore: number }[] = data.rubric?.items ?? [];
  const maxTotal = items.reduce((s, it) => s + it.maxScore, 0);

  function currentScores(username: string, ballots: any[]): number[] {
    if (scores[username]) return scores[username];
    const mine = ballots.find((b: any) => b.gradedBy === meUsername);
    if (mine) return mine.scores;
    return items.map(() => 0);
  }

  let lastCat = "";
  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-xs text-slate-500">Multiple trainers can score the same trainee — each keeps their own ballot, the trainee earns the average.</p>
      {data.rows.map((r: any) => {
        const ballots: any[] = r.ballots ?? (r.grade ? [{ ...r.grade }] : []);
        const cur = currentScores(r.username, ballots);
        const earned = cur.reduce((s, v) => s + (Number(v) || 0), 0);
        const pct = maxTotal ? Math.round((earned / maxTotal) * 100) : 0;
        const isOpen = openUser === r.username;
        return (
          <div key={r.username} className="rounded-xl border px-3 py-2">
            <button onClick={() => setOpenUser(isOpen ? null : r.username)} className="flex w-full items-center gap-2 text-left text-sm">
              <span className="min-w-0 flex-1">
                <span className="font-bold">{r.displayName}</span>{" "}
                <span className="font-mono text-xs text-slate-500">@{r.username}</span>
              </span>
              {r.average !== null && r.average !== undefined ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200">
                  avg {r.average}% • {ballots.length} ballot{ballots.length === 1 ? "" : "s"}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">not graded</span>
              )}
            </button>
            {isOpen && (
              <div className="mt-2 border-t pt-2">
                {ballots.length > 0 && (
                  <div className="mb-2 space-y-0.5 rounded-xl bg-slate-50 p-2 text-xs">
                    {ballots.map((b: any, bi: number) => (
                      <p key={bi}>
                        <span className="font-bold">{b.percent}%</span> by {b.gradedBy}
                        <span className="text-slate-500"> • {new Date(b.at).toLocaleDateString()}</span>
                        {b.gradedBy === meUsername && <span className="font-bold"> (your ballot)</span>}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Your ballot</p>
                {items.map((it, i) => {
                  const showCat = it.category !== lastCat;
                  lastCat = it.category;
                  return (
                    <div key={i}>
                      {showCat && <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">{it.category}</p>}
                      <div className="flex items-center gap-2 py-1 text-sm">
                        <span className="min-w-0 flex-1">{it.criterion}</span>
                        <input
                          type="number"
                          min={0}
                          max={it.maxScore}
                          value={cur[i]}
                          onChange={(e) => {
                            const n = [...cur];
                            n[i] = Math.max(0, Math.min(it.maxScore, Number(e.target.value) || 0));
                            setScores({ ...scores, [r.username]: n });
                          }}
                          className="w-20 rounded-lg border px-2 py-1.5 text-center font-mono"
                        />
                        <span className="w-12 text-right font-mono text-xs text-slate-500">/ {it.maxScore}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm font-black">
                    Yours: {earned}/{maxTotal} = {pct}%
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const res = await (gradeTrainee as any)({ token, evaluationId: evaluationId as any, username: r.username, scores: cur });
                        setScores({ ...scores, [r.username]: cur });
                        setMsg(`Saved ${r.displayName}: your ${res.percent}%, average now ${res.average}% (+${res.xp} XP)`);
                      } catch (e: any) {
                        setMsg(e?.message ?? "Error");
                      }
                    }}
                    className="btn-primary ml-auto rounded-xl px-5 py-2 text-sm font-bold"
                  >
                    Save my ballot
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {msg && <p className="text-xs">{msg}</p>}
    </div>
  );
}
