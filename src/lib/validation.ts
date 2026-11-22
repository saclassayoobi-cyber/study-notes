import type { NoteInput } from "@/lib/notes";

export type ValidationResult =
  | { ok: true; value: NoteInput }
  | { ok: false; errors: Record<string, string> };

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function validateNoteInput(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  const title = str(formData, "title");
  const summary = str(formData, "summary");
  const body = str(formData, "body");
  const tags = str(formData, "tags");
  const semester = str(formData, "semester") || "General";
  const subjectName = str(formData, "subject");

  if (title.length < 4) errors.title = "Give the note a title of at least 4 characters.";
  if (title.length > 220) errors.title = "Titles must stay under 220 characters.";
  if (summary.length < 12) errors.summary = "Write a one-sentence summary (12+ characters).";
  if (summary.length > 400) errors.summary = "Summaries must stay under 400 characters.";
  if (body.length < 40) errors.body = "Add at least 40 characters of study content.";
  if (!subjectName) errors.subject = "Pick a subject or type a new one.";
  if (subjectName.length > 120) errors.subject = "Subject names must stay under 120 characters.";
  if (semester.length > 80) errors.semester = "Semester labels must stay under 80 characters.";
  if (body.length > 40000) errors.body = "Notes are limited to 40,000 characters.";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      summary,
      body: body.replace(/\r\n/g, "\n"),
      tags,
      semester,
      subjectName,
    },
  };
}

export function parseId(value: string | undefined | null): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
