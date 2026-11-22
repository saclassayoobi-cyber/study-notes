import { listSemesters, listSubjects } from "@/lib/notes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [subjects, semesters] = await Promise.all([listSubjects(), listSemesters()]);
    return Response.json({ subjects, semesters });
  } catch (error) {
    return Response.json(
      { error: "Failed to list subjects", detail: String(error) },
      { status: 500 },
    );
  }
}
