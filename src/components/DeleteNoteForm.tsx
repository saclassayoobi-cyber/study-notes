"use client";

import { removeNote } from "@/app/actions";

export default function DeleteNoteForm({
  id,
  title,
}: {
  id: number;
  title: string;
}) {
  return (
    <form
      action={removeNote}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="no-print inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-red-600 transition hover:bg-red-50"
      >
        Delete note
      </button>
    </form>
  );
}
