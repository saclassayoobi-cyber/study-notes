"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type Props = {
  subjects: { slug: string; name: string; noteCount: number }[];
  semesters: string[];
  total: number;
};

function buildQuery(
  params: URLSearchParams,
  patch: Record<string, string | null>,
): string {
  const next = new URLSearchParams(params.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
  }
  return next.toString();
}

export default function SearchFilters({ subjects, semesters, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSubject = searchParams.get("subject") ?? "all";
  const activeSemester = searchParams.get("semester") ?? "all";
  const activeSort = searchParams.get("sort") ?? "recent";
  const urlQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [isPending, startTransition] = useTransition();
  const firstRender = useRef(true);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const qs = buildQuery(searchParams, { q: query.trim() || null });
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 280);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function push(patch: Record<string, string | null>) {
    const qs = buildQuery(searchParams, patch);
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  const showSemesters = semesters.length > 1;

  return (
    <section className="no-print mb-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes by topic, keyword, or subject…"
            aria-label="Search notes"
            className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-[15px] text-ink placeholder:text-muted/70 transition focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="sort">
            Sort notes
          </label>
          <select
            id="sort"
            value={activeSort}
            onChange={(event) =>
              push({ sort: event.target.value === "recent" ? null : event.target.value })
            }
            className="rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink transition hover:border-navy/40"
          >
            <option value="recent">Recently updated</option>
            <option value="title">Title A–Z</option>
          </select>
          <span className="hidden whitespace-nowrap rounded-xl bg-navy-soft px-3.5 py-3 text-[13px] font-semibold text-navy-deep sm:block">
            {isPending ? "Searching…" : `${total} note${total === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          label="All subjects"
          active={activeSubject === "all"}
          onClick={() => push({ subject: null })}
        />
        {subjects.map((subject) => (
          <FilterChip
            key={subject.slug}
            label={subject.name}
            count={subject.noteCount}
            active={activeSubject === subject.slug}
            onClick={() =>
              push({ subject: activeSubject === subject.slug ? null : subject.slug })
            }
          />
        ))}
      </div>

      {showSemesters ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="mr-1 text-[12px] font-semibold uppercase tracking-[0.09em] text-muted">
            Semester
          </span>
          <FilterChip
            label="All"
            small
            active={activeSemester === "all"}
            onClick={() => push({ semester: null })}
          />
          {semesters.map((semester) => (
            <FilterChip
              key={semester}
              label={semester}
              small
              active={activeSemester === semester}
              onClick={() =>
                push({ semester: activeSemester === semester ? null : semester })
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
  small,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border transition ${
        small ? "px-2.5 py-1 text-[12.5px]" : "px-3.5 py-1.5 text-[13.5px]"
      } ${
        active
          ? "border-navy bg-navy text-white"
          : "border-line bg-surface text-ink hover:border-navy/50 hover:bg-navy-soft"
      }`}
    >
      {label}
      {typeof count === "number" ? (
        <span
          className={`rounded-full px-1.5 text-[11px] font-semibold ${
            active ? "bg-white/20 text-white" : "bg-navy-soft text-navy-deep"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
