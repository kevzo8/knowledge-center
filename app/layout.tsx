import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "../components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "SVI Knowledge Center",
  description: "Trainee / Trainer knowledge center — lectures by day, activities, quizzes, gamified stats.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
