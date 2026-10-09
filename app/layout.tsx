import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "../components/ConvexClientProvider";
import { ThemeInitScript } from "../components/ThemeToggle";

// Inter is the closest open match to San Francisco; on Apple devices the
// system SF fonts take over automatically via the CSS font stack.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SVI Knowledge Center",
  description: "Trainee / Trainer knowledge center — lectures by day, activities, quizzes, gamified stats.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className="min-h-screen antialiased">
        <ThemeInitScript />
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
