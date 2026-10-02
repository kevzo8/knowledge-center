"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => {
    if (!url) return null;
    return new ConvexReactClient(url);
  }, [url]);
  if (!client) {
    return (
      <div className="mx-auto max-w-xl p-10 text-center text-sm text-slate-600">
        Missing <code>NEXT_PUBLIC_CONVEX_URL</code>. Copy <code>.env.example</code> to{" "}
        <code>.env.local</code> and run <code>npx convex dev</code>.
      </div>
    );
  }
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
