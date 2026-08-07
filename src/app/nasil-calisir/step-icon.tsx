const paths: Record<string, string> = {
  search: "M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35",
  "credit-card": "M3 6h18v12H3z M3 10h18 M7 15h4",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18z M12 7v5l3.5 2",
  "check-circle": "M12 21a9 9 0 100-18 9 9 0 000 18z M8 12.5l2.5 2.5 5-5",
  "user-plus": "M9 11a4 4 0 100-8 4 4 0 000 8z M2 21c0-4 3-6 7-6s7 2 7 6 M19 8v6 M22 11h-6",
  megaphone: "M3 11v2a2 2 0 002 2h1l3 5V4l-3 5H5a2 2 0 00-2 2z M14 8a4 4 0 010 8 M18 5a8 8 0 010 14",
  bell: "M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z M10 21a2 2 0 004 0",
  banknote: "M3 7h18v10H3z M12 9a3 3 0 100 6 3 3 0 000-6z M6 9v.01 M18 15v.01",
  "shield-check": "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z M9 12l2 2 4-4",
  refresh: "M4 4v6h6 M20 20v-6h-6 M5.5 15a8 8 0 0014.2-3 M18.5 9A8 8 0 004.3 12",
  gift: "M20 12v9H4v-9 M2 7h20v5H2z M12 7v14 M12 7c-1.5 0-3-1-3-2.5S9.5 2 11 2s1 2 1 5z M12 7c1.5 0 3-1 3-2.5S14.5 2 13 2s-1 2-1 5z",
};

export function StepIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const d = paths[name] ?? paths.search;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
