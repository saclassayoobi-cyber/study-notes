import { deleteNote, getNote, updateNote } from "@/lib/notes";
import { parseId, validateNoteInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { id } = await params;
  const noteId = parseId(id);
  if (!noteId) return Response.json({ error: "Invalid id" }, { status: 400 });

  const note = await getNote(noteId);
  if (!note) return Response.json({ error: "Note not found" }, { status: 404 });

  return Response.json({ note });
}

export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  const noteId = parseId(id);
  if (!noteId) return Response.json({ error: "Invalid id" }, { status: 400 });

  let formData: FormData;
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === "string") formData.set(key, value);
    }
  } catch {
    return Response.json({ error: "Expected a JSON object body" }, { status: 400 });
  }

  const result = validateNoteInput(formData);
  if (!result.ok) {
    return Response.json(
      { error: "Validation failed", errors: result.errors },
      { status: 422 },
    );
  }

  const updated = await updateNote(noteId, result.value);
  if (!updated) return Response.json({ error: "Note not found" }, { status: 404 });

  return Response.json({ id: noteId, updated: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  const noteId = parseId(id);
  if (!noteId) return Response.json({ error: "Invalid id" }, { status: 400 });

  const deleted = await deleteNote(noteId);
  if (!deleted) return Response.json({ error: "Note not found" }, { status: 404 });

  return Response.json({ id: noteId, deleted: true });
}
