"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMe } from "../../lib/useMe";
import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "../../components/ThemeToggle";
import { Inbox, MessageSquarePlus, Send } from "lucide-react";

const KINDS = [
  { id: "suggestion", label: "Suggestion — make the app better" },
  { id: "comment", label: "Comment — anything on your mind" },
  { id: "question", label: "Question — ask your trainers" },
] as const;

export default function Feedback() {
  const { token, me, loading } = useMe();
  const threads = useQuery(
    (api as any)?.feedback?.myThreads,
    token ? { token } : "skip"
  ) as any[] | undefined;
  const submitThread = useMutation((api as any)?.feedback?.submitThread);
  const replyOwn = useMutation((api as any)?.feedback?.replyOwn);
  const markSeen = useMutation((api as any)?.feedback?.markSeen);

  const [kind, setKind] = useState<string>("suggestion");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [msg, setMsg] = useState("");

  if (loading) return <p className="p-10 text-center text-sm">Loading…</p>;
  if (!token || !me)
    return (
      <main className="p-10 text-center">
        Not logged in. <a href="/login" className="underline">Login</a>
      </main>
    );

  async function send() {
    if (!token) return;
    setMsg("");
    try {
      await (submitThread as any)({ token, kind: kind as any, subject, body });
      setSubject("");
      setBody("");
      setMsg("Sent — trainers will reply here.");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed");
    }
  }

  async function openThread(id: string, hasNew: boolean) {
    setOpenId(openId === id ? null : id);
    setReply("");
    if (hasNew && token) {
      try {
        await (markSeen as any)({ token, feedbackId: id as any });
      } catch {}
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between gap-2">
        <Link href="/dashboard" className="text-sm underline">← Dashboard</Link>
        <ThemeToggle />
      </div>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-black">
        <Inbox size={22} /> Suggestion box
      </h1>
      <p className="text-sm text-slate-500">
        Suggestions, comments, questions — trainers reply right here. Help improve the app.
      </p>

      <div className="mt-4 rounded-2xl border bg-white p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest">
          <MessageSquarePlus size={15} /> New message
        </h2>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
          <select className="rounded-xl border px-3 py-2 sm:col-span-1" value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
          <input
            className="rounded-xl border px-3 py-2 sm:col-span-2"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <textarea
          className="mt-2 h-24 w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Write it out…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button onClick={send} className="btn-primary mt-2 inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-bold">
          <Send size={14} /> Send
        </button>
        {msg && <p className="mt-1 text-xs">{msg}</p>}
      </div>

      <h2 className="mt-6 text-sm font-bold uppercase tracking-widest">
        My threads ({threads?.length ?? "…"})
      </h2>
      <div className="mt-2 space-y-2">
        {!threads && <p className="text-sm text-slate-500">Loading…</p>}
        {threads?.map((t) => {
          const isOpen = openId === String(t._id);
          return (
            <div key={String(t._id)} className="rounded-2xl border bg-white px-4 py-3">
              <button onClick={() => openThread(String(t._id), t.hasNewReply)} className="flex w-full items-center gap-2 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">
                    {t.hasNewReply && <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-500" />}
                    {t.subject}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {t.kind} • {t.status}
                    {t.hasNewReply ? " • new reply!" : ""} • {t.replies.length} repl{t.replies.length === 1 ? "y" : "ies"}
                  </span>
                </span>
              </button>
              {isOpen && (
                <div className="mt-2 border-t pt-2 text-sm">
                  <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-2.5">{t.body}</p>
                  <div className="mt-2 space-y-1.5">
                    {t.replies.map((r: any, i: number) => (
                      <div key={i} className={`rounded-xl p-2.5 ${r.mine ? "ml-6 bg-sky-50 dark:bg-sky-950/50" : "mr-6 bg-emerald-50 dark:bg-emerald-950/50"}`}>
                        <p className="whitespace-pre-wrap">{r.body}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {r.mine ? "you" : r.by} • {new Date(r.at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  {t.status !== "closed" ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"
                        placeholder="Reply…"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                      />
                      <button
                        onClick={async () => {
                          if (!token || !reply.trim()) return;
                          await (replyOwn as any)({ token, feedbackId: t._id, body: reply.trim() });
                          setReply("");
                        }}
                        className="btn-primary shrink-0 rounded-xl px-4 py-2 text-sm font-bold"
                      >
                        Send
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">Closed by trainers — thanks!</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {threads && threads.length === 0 && (
          <p className="text-sm text-slate-500">Nothing yet — send the first one above.</p>
        )}
      </div>
    </main>
  );
}
