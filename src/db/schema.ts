import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const subjects = pgTable(
  "subjects",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("subjects_slug_unique").on(table.slug)],
);

export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull(),
    summary: varchar("summary", { length: 400 }).notNull(),
    body: text("body").notNull(),
    tags: text("tags").notNull().default(""),
    semester: varchar("semester", { length: 80 }).notNull().default("General"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("notes_slug_unique").on(table.slug),
    index("notes_subject_id_idx").on(table.subjectId),
  ],
);

export type Subject = typeof subjects.$inferSelect;
export type Note = typeof notes.$inferSelect;
