import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import NoteForm from "@/components/NoteForm";
import { getNote, listSemesters, listSubjects } from "@/lib/notes";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const note = await getNote(Number(id));
  return { title: note ? `Edit: ${note.title}` : "Edit note" };
}

export default async function EditNotePage({ params }: { params: Params }) {
  const { id } = await params;
  const noteId = Number(id);
  if (!Number.isInteger(noteId) || noteId <= 0) notFound();

  const [note, subjects, semesters] = await Promise.all([
    getNote(noteId),
    listSubjects(),
    listSemesters(),
  ]);

  if (!note) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <nav className="mb-6 flex items-center gap-2 text-[13px] text-muted">
        <Link href="/" className="hover:text-navy">
          Library
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/notes/${note.id}`} className="hover:text-navy">
          {note.title}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">Edit</span>
      </nav>

      <header className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
          Editing
        </p>
        <h1 className="mt-2 text-[clamp(1.5rem,3.6vw,2rem)] font-bold leading-tight tracking-[-0.02em] text-ink">
          {note.title}
        </h1>
      </header>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <NoteForm
          note={note}
          subjects={subjects.map((subject) => subject.name)}
          semesters={semesters}
        />
      </div>
    </div>
  );
}
