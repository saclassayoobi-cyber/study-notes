import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Study Notes Hub — Semester & Subject Notes",
    template: "%s · Study Notes Hub",
  },
  description:
    "Organized lecture summaries, key concepts, and revision guides in one place.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="no-print border-b border-line bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <Link href="/" className="group flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-[15px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(31,78,120,0.7)]">
                  SN
                </span>
                <span className="leading-tight">
                  <span className="block text-[17px] font-bold tracking-[-0.02em] text-ink">
                    Study Notes Hub
                  </span>
                  <span className="block text-[12.5px] text-muted">
                    Semester &amp; subject notes
                  </span>
                </span>
              </Link>
              <nav className="flex items-center gap-1 text-[14px] font-medium">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-2 text-muted transition hover:bg-navy-soft hover:text-navy-deep"
                >
                  Library
                </Link>
                <Link
                  href="/?sort=title"
                  className="hidden rounded-lg px-3 py-2 text-muted transition hover:bg-navy-soft hover:text-navy-deep sm:block"
                >
                  A–Z
                </Link>
                <Link
                  href="/notes/new"
                  className="rounded-lg bg-navy px-3.5 py-2 text-white transition hover:bg-navy-deep"
                >
                  New note
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="no-print border-t border-line bg-surface">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-7 text-[13px] text-muted sm:px-8">
              <p>
                Built for structured study and quick exam revision. Notes are
                stored in PostgreSQL.
              </p>
              <p className="font-mono text-[12px] text-muted/80">
                Next.js · Drizzle · Postgres
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
