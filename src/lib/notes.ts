import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { notes, subjects, type Note, type Subject } from "@/db/schema";
import { slugify } from "@/lib/text";

export type NoteWithSubject = Note & {
  subjectName: string;
  subjectSlug: string;
};

export type SubjectWithCount = Subject & { noteCount: number };

export type ListFilters = {
  q?: string;
  subject?: string;
  semester?: string;
  sort?: "recent" | "title";
};

const baseSelection = {
  id: notes.id,
  subjectId: notes.subjectId,
  title: notes.title,
  slug: notes.slug,
  summary: notes.summary,
  body: notes.body,
  tags: notes.tags,
  semester: notes.semester,
  createdAt: notes.createdAt,
  updatedAt: notes.updatedAt,
  subjectName: subjects.name,
  subjectSlug: subjects.slug,
};

function scope(filter: { subject?: string; semester?: string }) {
  const clauses = [];
  if (filter.subject && filter.subject !== "all") {
    clauses.push(eq(subjects.slug, filter.subject));
  }
  if (filter.semester && filter.semester !== "all") {
    clauses.push(eq(notes.semester, filter.semester));
  }
  return clauses.length ? and(...clauses) : undefined;
}

export async function listNotes(
  filters: ListFilters = {},
): Promise<NoteWithSubject[]> {
  await ensureSeeded();

  const where = scope(filters);
  const query = filters.q?.trim();

  const searchCondition = query
    ? or(
        ilike(notes.title, `%${query}%`),
        ilike(notes.summary, `%${query}%`),
        ilike(notes.body, `%${query}%`),
        ilike(notes.tags, `%${query}%`),
        ilike(notes.semester, `%${query}%`),
        ilike(subjects.name, `%${query}%`),
      )
    : undefined;

  const orderBy =
    filters.sort === "title"
      ? [asc(notes.title)]
      : [desc(notes.updatedAt), desc(notes.id)];

  return db
    .select(baseSelection)
    .from(notes)
    .innerJoin(subjects, eq(notes.subjectId, subjects.id))
    .where(where && searchCondition ? and(where, searchCondition) : (searchCondition ?? where))
    .orderBy(...orderBy)
    .limit(200);
}

export async function getNote(id: number): Promise<NoteWithSubject | null> {
  await ensureSeeded();
  const rows = await db
    .select(baseSelection)
    .from(notes)
    .innerJoin(subjects, eq(notes.subjectId, subjects.id))
    .where(eq(notes.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getNoteBySlug(
  slug: string,
): Promise<NoteWithSubject | null> {
  await ensureSeeded();
  const rows = await db
    .select(baseSelection)
    .from(notes)
    .innerJoin(subjects, eq(notes.subjectId, subjects.id))
    .where(eq(notes.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getNeighbourNotes(id: number) {
  const rows = await db
    .select({
      id: notes.id,
      title: notes.title,
      subjectName: subjects.name,
    })
    .from(notes)
    .innerJoin(subjects, eq(notes.subjectId, subjects.id))
    .orderBy(asc(notes.id));

  const index = rows.findIndex((row) => row.id === id);
  return {
    previous: index > 0 ? rows[index - 1] : null,
    next: index >= 0 && index < rows.length - 1 ? rows[index + 1] : null,
    position: index >= 0 ? index + 1 : null,
    total: rows.length,
  };
}

export async function listSubjects(): Promise<SubjectWithCount[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      id: subjects.id,
      name: subjects.name,
      slug: subjects.slug,
      description: subjects.description,
      createdAt: subjects.createdAt,
      noteCount: sql<number>`count(${notes.id})::int`,
    })
    .from(subjects)
    .leftJoin(notes, eq(notes.subjectId, subjects.id))
    .groupBy(subjects.id)
    .orderBy(asc(subjects.name));
  return rows;
}

export async function listSemesters(): Promise<string[]> {
  await ensureSeeded();
  const rows = await db
    .selectDistinct({ semester: notes.semester })
    .from(notes)
    .orderBy(asc(notes.semester));
  return rows.map((row) => row.semester).filter(Boolean);
}

export async function libraryStats() {
  await ensureSeeded();
  const [row] = await db
    .select({
      noteCount: sql<number>`count(*)::int`,
      wordCount: sql<number>`coalesce(sum(array_length(regexp_split_to_array(trim(notes.body), '\\s+'), 1)), 0)::int`,
    })
    .from(notes);

  const subjectRows = await listSubjects();

  return {
    noteCount: row?.noteCount ?? 0,
    wordCount: row?.wordCount ?? 0,
    subjectCount: subjectRows.length,
    revisionMinutes: Math.max(1, Math.round((row?.wordCount ?? 0) / 200)),
  };
}

export type NoteInput = {
  title: string;
  summary: string;
  body: string;
  tags: string;
  semester: string;
  subjectName: string;
};

export async function resolveSubjectId(subjectName: string): Promise<number> {
  const name = subjectName.trim();
  const slug = slugify(name);

  const existing = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.slug, slug))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const [created] = await db
    .insert(subjects)
    .values({ name: name.slice(0, 120), slug })
    .returning({ id: subjects.id });

  return created.id;
}

export async function createNote(input: NoteInput): Promise<number> {
  await ensureSeeded();
  const subjectId = await resolveSubjectId(input.subjectName);
  const slug = await uniqueSlug(`${slugify(input.title)}`);

  const [created] = await db
    .insert(notes)
    .values({
      subjectId,
      title: input.title,
      slug,
      summary: input.summary,
      body: input.body,
      tags: input.tags,
      semester: input.semester,
      updatedAt: new Date(),
    })
    .returning({ id: notes.id });

  return created.id;
}

export async function updateNote(
  id: number,
  input: NoteInput,
): Promise<boolean> {
  await ensureSeeded();
  const subjectId = await resolveSubjectId(input.subjectName);

  const updated = await db
    .update(notes)
    .set({
      subjectId,
      title: input.title,
      summary: input.summary,
      body: input.body,
      tags: input.tags,
      semester: input.semester,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, id))
    .returning({ id: notes.id });

  return updated.length > 0;
}

export async function deleteNote(id: number): Promise<boolean> {
  const deleted = await db
    .delete(notes)
    .where(eq(notes.id, id))
    .returning({ id: notes.id });
  return deleted.length > 0;
}

async function uniqueSlug(base: string, ignoreId?: number): Promise<string> {
  const candidates = [base];
  for (let i = 2; i < 40; i += 1) candidates.push(`${base}-${i}`);

  for (const candidate of candidates) {
    const rows = await db
      .select({ id: notes.id })
      .from(notes)
      .where(eq(notes.slug, candidate))
      .limit(1);
    if (!rows[0] || rows[0].id === ignoreId) return candidate;
  }
  return `${base}-${Date.now()}`;
}
