import type { Metadata } from "next";
import { Roboto, Roboto_Slab, Roboto_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "../components/ConvexClientProvider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});
const slab = Roboto_Slab({
  variable: "--font-slab",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const mono = Roboto_Mono({
  variable: "--font-robomon",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SVI Knowledge Center",
  description: "Trainee / Trainer knowledge center — lectures by day, activities, quizzes, gamified stats.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${slab.variable} ${mono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
