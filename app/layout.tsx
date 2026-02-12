import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chiffrage - Nathan",
  description: "Suivi du chiffrage quotidien",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center gap-6 h-12">
            <Link
              href="/"
              className="font-semibold text-sm text-zinc-900 dark:text-zinc-100"
            >
              Chiffrage
            </Link>
            <div className="flex gap-4 text-sm">
              <Link
                href="/"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Calendrier
              </Link>
              <Link
                href="/stats"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Stats
              </Link>
              <Link
                href="/export"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Export
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
