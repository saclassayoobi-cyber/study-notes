export function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || "note";
}

/** Body is stored as plain text with blank lines between blocks. */
export type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] };

export function parseBody(body: string): Block[] {
  const chunks = body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const blocks: Block[] = [];

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim());
    const isBulletList = lines.every((line) => /^[-*•]\s+/.test(line));

    if (isBulletList) {
      blocks.push({
        kind: "bullets",
        items: lines.map((line) => line.replace(/^[-*•]\s+/, "")),
      });
      continue;
    }

    const headingMatch = chunk.match(/^#{2,3}\s+(.*)$/);
    if (headingMatch) {
      blocks.push({ kind: "heading", text: headingMatch[1].trim() });
      continue;
    }

    blocks.push({ kind: "paragraph", text: lines.join(" ") });
  }

  return blocks;
}

export function parseTags(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateFmt.format(date);
}

export function excerpt(body: string, max = 160): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max).trimEnd()}…`;
}
