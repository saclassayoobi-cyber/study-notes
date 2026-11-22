import { parseBody } from "@/lib/text";

export default function ReaderBody({ body }: { body: string }) {
  const blocks = parseBody(body);

  if (!blocks.length) {
    return <p className="reader text-muted">This note has no content yet.</p>;
  }

  return (
    <div className="reader space-y-5">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h3
              key={index}
              className="reader-block pt-3 text-[15px] font-sans font-bold uppercase tracking-[0.08em] text-navy-deep"
            >
              {block.text}
            </h3>
          );
        }

        if (block.kind === "bullets") {
          return (
            <ul key={index} className="reader-block space-y-2 pl-1">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-navy"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="reader-block">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
