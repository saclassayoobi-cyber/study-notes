import type { Metadata } from "next";

import NoteForm from "@/components/NoteForm";
import { listSemesters, listSubjects } from "@/lib/notes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add a note",
  description: "Create a new study note in the library.",
};

export default async function NewNotePage() {
  const [subjects, semesters] = await Promise.all([listSubjects(), listSemesters()]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <header className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
          New entry
        </p>
        <h1 className="mt-2 text-[clamp(1.6rem,4vw,2.1rem)] font-bold tracking-[-0.02em] text-ink">
          Add a study note
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Capture the lecture while it is fresh — headings, bullets, and
          paragraphs are all supported.
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <NoteForm
          subjects={subjects.map((subject) => subject.name)}
          semesters={semesters}
        />
      </div>
    </div>
  );
}
