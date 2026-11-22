"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createNote, deleteNote, updateNote } from "@/lib/notes";
import { parseId, validateNoteInput } from "@/lib/validation";

export type NoteFormState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string>;
};

export const emptyFormState: NoteFormState = { status: "idle" };

export async function saveNote(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const id = parseId(formData.get("id")?.toString());
  const result = validateNoteInput(formData);

  if (!result.ok) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: result.errors,
    };
  }

  let savedId: number;
  if (id) {
    const updated = await updateNote(id, result.value);
    if (!updated) {
      return { status: "error", message: "That note no longer exists." };
    }
    savedId = id;
  } else {
    savedId = await createNote(result.value);
  }

  revalidatePath("/");
  revalidatePath(`/notes/${savedId}`);

  redirect(`/notes/${savedId}`);
}

export async function removeNote(formData: FormData): Promise<void> {
  const id = parseId(formData.get("id")?.toString());
  if (id) {
    await deleteNote(id);
    revalidatePath("/");
  }
  redirect("/");
}
