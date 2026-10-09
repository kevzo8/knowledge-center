"use client";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMe } from "../../lib/useMe";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "../../components/ThemeToggle";
import { KeyRound, Save, UserRound } from "lucide-react";

export default function Settings() {
  const { token, me, loading } = useMe();
  const updateMe = useMutation((api as any)?.auth?.updateMe);
  const [name, setName] = useState("");
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me) setName(me.displayName);
  }, [me]);

  if (loading) return <p className="p-10 text-center text-sm">Loading…</p>;
  if (!token || !me)
    return (
      <main className="p-10 text-center">
        Not logged in. <a href="/login" className="underline">Login</a>
      </main>
    );

  async function saveName() {
    if (!token || name.trim().length < 2) {
      setMsg("Display name too short");
      return;
    }
    setBusy(true);
    try {
      await (updateMe as any)({ token, displayName: name.trim() });
      setMsg("Display name updated");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed");
    }
    setBusy(false);
  }

  async function savePw() {
    if (!token) return;
    if (nw.length < 4) {
      setMsg("New password too short (min 4)");
      return;
    }
    setBusy(true);
    try {
      await (updateMe as any)({ token, currentPassword: cur, newPassword: nw });
      setCur("");
      setNw("");
      setMsg("Password changed");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed — check your current password");
    }
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-8">
      <div className="flex items-center justify-between gap-2">
        <Link href="/dashboard" className="text-sm underline">← Dashboard</Link>
        <ThemeToggle />
      </div>
      <h1 className="mt-2 text-2xl font-black">Settings</h1>
      <p className="text-sm text-slate-500">Signed in as @{me.username} • {me.role}</p>
      {msg && <p className="mt-3 rounded-xl border px-3 py-2 text-sm">{msg}</p>}

      <div className="mt-4 rounded-2xl border bg-white p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest">
          <UserRound size={15} /> Display name
        </h2>
        <div className="mt-2 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
          />
          <button
            onClick={saveName}
            disabled={busy}
            className="btn-primary inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border bg-white p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest">
          <KeyRound size={15} /> Change password
        </h2>
        <div className="mt-2 space-y-2">
          <input
            type="password"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            value={cur}
            onChange={(e) => setCur(e.target.value)}
            placeholder="Current password"
          />
          <input
            type="password"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            value={nw}
            onChange={(e) => setNw(e.target.value)}
            placeholder="New password (min 4)"
          />
          <button
            onClick={savePw}
            disabled={busy}
            className="btn-primary inline-flex w-full items-center justify-center gap-1 rounded-xl py-2 text-sm font-bold disabled:opacity-50"
          >
            <Save size={14} /> Change password
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Forgot it? An admin can reset it for you (Admin → Users → Reset pw).
        </p>
      </div>
    </main>
  );
}
