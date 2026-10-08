"use client";
import { useEffect, useState } from "react";

export function ThemeInitScript() {
  const code = `(function(){try{var t=localStorage.getItem("kc-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("kc-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-full border bg-white px-4 py-2 text-sm font-bold shadow-lg transition hover:scale-105"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
