"use client";
import { useEffect, useId, useRef, useState } from "react";

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          fontFamily: "inherit",
          flowchart: { htmlLabels: true, curve: "rounded" },
        });
        const { svg } = await mermaid.render(`mmd-${rawId}`, chart);
        if (alive && ref.current) ref.current.innerHTML = svg;
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [chart, rawId]);

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded-xl bg-slate-100 p-3 font-mono text-xs dark:bg-slate-800">
        {chart}
      </pre>
    );
  }
  return <div ref={ref} className="mermaid-slide overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full" />;
}
