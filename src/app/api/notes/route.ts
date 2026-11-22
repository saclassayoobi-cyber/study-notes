import { createNote, listNotes } from "@/lib/notes";
import { validateNoteInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sortParam = url.searchParams.get("sort");

  try {
    const notes = await listNotes({
      q: url.searchParams.get("q") ?? undefined,
      subject: url.searchParams.get("subject") ?? undefined,
      semester: url.searchParams.get("semester") ?? undefined,
      sort: sortParam === "title" ? "title" : "recent",
    });

    return Response.json({ count: notes.length, notes });
  } catch (error) {
    return Response.json(
      { error: "Failed to list notes", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

  try {
    const id = await createNote(result.value);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Failed to create note", detail: String(error) },
      { status: 500 },
    );
  }
}
