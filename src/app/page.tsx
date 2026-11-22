import { Suspense } from "react";
import Link from "next/link";

import NoteCard from "@/components/NoteCard";
import SearchFilters from "@/components/SearchFilters";
import { libraryStats, listNotes, listSemesters, listSubjects } from "@/lib/notes";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  subject?: string;
  semester?: string;
  sort?: string;
}>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sort = params.sort === "title" ? "title" : "recent";

  const [notes, subjects, semesters, stats] = await Promise.all([
    listNotes({ q: params.q, subject: params.subject, semester: params.semester, sort }),
    listSubjects(),
    listSemesters(),
    libraryStats(),
  ]);

  const filtering = Boolean(params.q || params.subject || params.semester);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8">
      <section className="animate-rise relative overflow-hidden rounded-3xl border border-navy/15 bg-navy px-6 py-10 text-white sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70">
            Revision library
          </p>
          <h1 className="mt-3 text-[clamp(1.9rem,4.4vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em]">
            Organized lecture summaries, key concepts, and revision guides.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80">
            Every note lives in PostgreSQL, so search, filters, and edits update
            instantly. Write once, revise everywhere — including print and PDF.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/notes/new"
              className="rounded-xl bg-white px-4.5 py-2.5 text-[14px] font-semibold text-navy-deep transition hover:bg-white/90"
            >
              Add a note
            </Link>
            <Link
              href="/#library"
              className="rounded-xl border border-white/30 px-4.5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
            >
              Browse the library
            </Link>
          </div>
        </div>

        <dl className="relative mt-9 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 sm:grid-cols-4">
          <Stat label="Notes" value={stats.noteCount} />
          <Stat label="Subjects" value={stats.subjectCount} />
          <Stat label="Words" value={stats.wordCount.toLocaleString()} />
          <Stat label="Rev. minutes" value={stats.revisionMinutes} />
        </dl>
      </section>

      <div id="library" className="mt-12 scroll-mt-8">
        <Suspense
          fallback={<div className="h-28 rounded-xl border border-line bg-surface" />}
        >
          <SearchFilters
            subjects={subjects.map((subject) => ({
              slug: subject.slug,
              name: subject.name,
              noteCount: subject.noteCount,
            }))}
            semesters={semesters}
            total={notes.length}
          />
        </Suspense>

        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
            <p className="text-[17px] font-semibold text-ink">
              {filtering ? "No matching notes found." : "Your library is empty."}
            </p>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-muted">
              {filtering
                ? "Try a different keyword, or clear the subject and semester filters."
                : "Add your first lecture summary to start building the revision library."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {filtering ? (
                <Link
                  href="/"
                  className="rounded-xl border border-line px-4 py-2.5 text-[14px] font-semibold text-ink transition hover:bg-navy-soft"
                >
                  Clear filters
                </Link>
              ) : null}
              <Link
                href="/notes/new"
                className="rounded-xl bg-navy px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-navy-deep"
              >
                New note
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
        {label}
      </dt>
      <dd className="mt-1 text-[26px] font-bold leading-none tracking-[-0.02em]">
        {value}
      </dd>
    </div>
  );
}
