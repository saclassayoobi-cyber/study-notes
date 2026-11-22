import Link from "next/link";

import type { NoteWithSubject } from "@/lib/notes";
import { excerpt, formatDate, parseTags, readingMinutes } from "@/lib/text";

export default function NoteCard({ note }: { note: NoteWithSubject }) {
  const tags = parseTags(note.tags);

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-navy/35 hover:shadow-lift">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-navy-soft px-2 py-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-navy-deep">
            {note.subjectName}
          </span>
          <span className="text-[11.5px] font-medium text-muted">
            {note.semester}
          </span>
        </div>

        <h2 className="text-[19px] font-bold leading-snug tracking-[-0.01em] text-ink">
          <Link href={`/notes/${note.id}`} className="hover:text-navy">
            {note.title}
          </Link>
        </h2>

        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          {note.summary || excerpt(note.body)}
        </p>

        {tags.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-line px-2 py-0.5 text-[11.5px] text-muted"
              >
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[12.5px] text-muted">
        <span>
          {formatDate(note.updatedAt)} · {readingMinutes(note.body)} min read
        </span>
        <Link
          href={`/notes/${note.id}`}
          className="font-semibold text-navy transition group-hover:underline"
        >
          Open note →
        </Link>
      </div>
    </article>
  );
}
