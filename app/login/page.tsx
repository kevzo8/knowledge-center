"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { setToken } from "../../lib/auth-token";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  const login = useMutation((api as any)?.auth?.login);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const res = await (login as any)({ username, password });
      setToken(res.token);
      router.push(res.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setErr("Invalid login — ask your admin for an account.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl border bg-white p-8 shadow">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600">
          SVI Knowledge Center
        </p>
        <h1 className="mt-2 text-xl font-black">Log in</h1>
        <p className="text-xs text-slate-500">
          Username + password only. Admin creates trainee / trainer accounts.
        </p>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2.5">
          <input
            className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="username e.g. juan.trainee"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            className="rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white"
            type="submit"
          >
            Login →
          </button>
          <a href="/" className="text-center text-xs text-slate-500 underline">
            ← Back
          </a>
        </form>
      </div>
    </main>
  );
}
