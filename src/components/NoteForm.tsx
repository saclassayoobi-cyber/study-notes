"use client";

import Link from "next/link";
import { useActionState } from "react";

import { emptyFormState, saveNote, type NoteFormState } from "@/app/actions";
import type { NoteWithSubject } from "@/lib/notes";

type Props = {
  subjects: string[];
  semesters: string[];
  note?: NoteWithSubject;
};

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70 transition focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15";
const labelClass =
  "mb-1.5 block text-[13px] font-semibold uppercase tracking-[0.07em] text-muted";

export default function NoteForm({ subjects, semesters, note }: Props) {
  const [state, formAction, pending] = useActionState<NoteFormState, FormData>(
    saveNote,
    emptyFormState,
  );

  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {note ? <input type="hidden" name="id" value={note.id} /> : null}

      {state.status === "error" && state.message ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="title">
            Note title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={note?.title ?? ""}
            placeholder="Cost Behavior, Break-Even & Margin of Safety"
            className={inputClass}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title ? (
            <p className="mt-1.5 text-[13px] text-red-600">{errors.title}</p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            list="subject-options"
            defaultValue={note?.subjectName ?? ""}
            placeholder="Management"
            className={inputClass}
            aria-invalid={Boolean(errors.subject)}
          />
          <datalist id="subject-options">
            {subjects.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>
          <p className="mt-1.5 text-[12.5px] text-muted">
            Choose an existing subject or type a new one.
          </p>
          {errors.subject ? (
            <p className="mt-1 text-[13px] text-red-600">{errors.subject}</p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="semester">
            Semester / term
          </label>
          <input
            id="semester"
            name="semester"
            list="semester-options"
            defaultValue={note?.semester ?? ""}
            placeholder="Semester 4"
            className={inputClass}
            aria-invalid={Boolean(errors.semester)}
          />
          <datalist id="semester-options">
            {semesters.map((semester) => (
              <option key={semester} value={semester} />
            ))}
          </datalist>
          {errors.semester ? (
            <p className="mt-1.5 text-[13px] text-red-600">{errors.semester}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="summary">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={2}
            defaultValue={note?.summary ?? ""}
            placeholder="One sentence describing what this note covers."
            className={inputClass}
            aria-invalid={Boolean(errors.summary)}
          />
          {errors.summary ? (
            <p className="mt-1.5 text-[13px] text-red-600">{errors.summary}</p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="tags">
            Keywords
          </label>
          <input
            id="tags"
            name="tags"
            defaultValue={note?.tags ?? ""}
            placeholder="costing, break-even, contribution"
            className={inputClass}
          />
          <p className="mt-1.5 text-[12.5px] text-muted">Comma separated.</p>
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-baseline justify-between">
            <label className={labelClass} htmlFor="body">
              Note content
            </label>
            <span className="text-[12px] text-muted">
              Blank line = new paragraph · “## ” = heading · “- ” = bullet
            </span>
          </div>
          <textarea
            id="body"
            name="body"
            rows={16}
            defaultValue={note?.body ?? ""}
            placeholder={"## Key idea\nState the concept in your own words.\n\n- Supporting point one\n- Supporting point two"}
            className={`${inputClass} font-mono text-[13.5px] leading-relaxed`}
            aria-invalid={Boolean(errors.body)}
          />
          {errors.body ? (
            <p className="mt-1.5 text-[13px] text-red-600">{errors.body}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-navy px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : note ? "Save changes" : "Create note"}
        </button>
        <Link
          href={note ? `/notes/${note.id}` : "/"}
          className="rounded-xl border border-line px-4 py-2.5 text-[14px] font-semibold text-muted transition hover:bg-navy-soft hover:text-navy-deep"
        >
          Cancel
        </Link>
        <span className="text-[12.5px] text-muted">
          Saved to PostgreSQL with a full-text searchable body.
        </span>
      </div>
    </form>
  );
}
