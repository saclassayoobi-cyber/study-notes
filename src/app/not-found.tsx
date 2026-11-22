import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-5 py-24 text-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
        404
      </p>
      <h1 className="mt-3 text-[26px] font-bold tracking-[-0.02em] text-ink">
        That note isn&apos;t in the library
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        It may have been deleted, or the link is out of date.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-xl bg-navy px-4.5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-navy-deep"
      >
        Back to the library
      </Link>
    </div>
  );
}
