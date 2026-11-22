"use client";

export default function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-navy-deep"
    >
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M6 7V3.5h8V7M6 14H4.5A1.5 1.5 0 013 12.5V9.5A1.5 1.5 0 014.5 8h11A1.5 1.5 0 0117 9.5v3a1.5 1.5 0 01-1.5 1.5H14M6 11h8v5.5H6V11z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}
