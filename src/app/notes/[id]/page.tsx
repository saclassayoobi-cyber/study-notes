import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import DeleteNoteForm from "@/components/DeleteNoteForm";
import PrintButton from "@/components/PrintButton";
import ReaderBody from "@/components/ReaderBody";
import { getNeighbourNotes, getNote } from "@/lib/notes";
import { excerpt, formatDate, parseTags, readingMinutes } from "@/lib/text";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const note = await getNote(Number(id));
  if (!note) return { title: "Note not found" };

  return {
    title: note.title,
    description: note.summary || excerpt(note.body),
  };
}

export default async function NotePage({ params }: { params: Params }) {
  const { id } = await params;
  const noteId = Number(id);
  if (!Number.isInteger(noteId) || noteId <= 0) notFound();

  const note = await getNote(noteId);
  if (!note) notFound();

  const [neighbours, tags] = await Promise.all([
    getNeighbourNotes(note.id),
    Promise.resolve(parseTags(note.tags)),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <nav className="no-print mb-6 flex items-center gap-2 text-[13px] text-muted">
        <Link href="/" className="hover:text-navy">
          Library
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/?subject=${note.subjectSlug}`}
          className="hover:text-navy"
        >
          {note.subjectName}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">Note #{note.id}</span>
      </nav>

      <article className="print-sheet rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-10">
        <header className="border-b border-line pb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-navy-soft px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-navy-deep">
              {note.subjectName}
            </span>
            <span className="inline-flex items-center rounded-md border border-line px-2.5 py-1 text-[11.5px] font-semibold text-muted">
              {note.semester}
            </span>
            <span className="text-[12.5px] text-muted">
              {readingMinutes(note.body)} min read
            </span>
          </div>

          <h1 className="text-[clamp(1.6rem,4vw,2.15rem)] font-bold leading-tight tracking-[-0.02em] text-ink">
            {note.title}
          </h1>

          {note.summary ? (
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
              {note.summary}
            </p>
          ) : null}

          <p className="mt-4 text-[12.5px] text-muted">
            Updated {formatDate(note.updatedAt)} · Created{" "}
            {formatDate(note.createdAt)}
          </p>
        </header>

        <div className="py-8">
          <ReaderBody body={note.body} />
        </div>

        {tags.length ? (
          <footer className="border-t border-line pt-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.09em] text-muted">
              Keywords
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md bg-navy-soft px-2.5 py-1 text-[12px] font-medium text-navy-deep"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </footer>
        ) : null}
      </article>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <PrintButton />
        <Link
          href={`/notes/${note.id}/edit`}
          className="no-print inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink transition hover:bg-navy-soft hover:text-navy-deep"
        >
          Edit note
        </Link>
        <DeleteNoteForm id={note.id} title={note.title} />
        <Link
          href="/"
          className="no-print ml-auto text-[13.5px] font-semibold text-navy hover:underline"
        >
          ← Back to library
        </Link>
      </div>

      {neighbours.position ? (
        <p className="no-print mt-10 text-center text-[12.5px] text-muted">
          Note {neighbours.position} of {neighbours.total} in the library
        </p>
      ) : null}

      <nav className="no-print mt-4 grid gap-3 sm:grid-cols-2">
        {neighbours.previous ? (
          <Link
            href={`/notes/${neighbours.previous.id}`}
            className="rounded-xl border border-line bg-surface p-4 transition hover:border-navy/40 hover:shadow-card"
          >
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.09em] text-muted">
              Previous
            </span>
            <span className="mt-1 block text-[14.5px] font-semibold text-ink">
              {neighbours.previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {neighbours.next ? (
          <Link
            href={`/notes/${neighbours.next.id}`}
            className="rounded-xl border border-line bg-surface p-4 text-right transition hover:border-navy/40 hover:shadow-card sm:justify-self-end sm:text-right"
          >
            <span className="block text-[11.5px] font-semibold uppercase tracking-[0.09em] text-muted">
              Next
            </span>
            <span className="mt-1 block text-[14.5px] font-semibold text-ink">
              {neighbours.next.title}
            </span>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
