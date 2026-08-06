const paths: Record<string, string> = {
  palette:
    "M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-.9.7-1.6 1.6-1.6H16a5 5 0 005-5c0-3.9-4-6.7-9-6.7z M7.5 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3z M11 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z M15.5 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
  code: "M9 18l-6-6 6-6 M15 6l6 6-6 6",
  pen: "M12 20h9 M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z",
  video: "M4 7h11v10H4z M15 10l5-3v10l-5-3",
  megaphone: "M3 11v2a2 2 0 002 2h1l3 5V4l-3 5H5a2 2 0 00-2 2z M14 8a4 4 0 010 8 M18 5a8 8 0 010 14",
  music: "M9 18V5l12-2v13 M9 18a3 3 0 11-6 0 3 3 0 016 0z M21 16a3 3 0 11-6 0 3 3 0 016 0z",
  briefcase: "M3 7h18v13H3z M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3 M3 13h18",
  book: "M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 16.5v-12z M4 16.5A2.5 2.5 0 016.5 19H20",
  sparkles:
    "M12 3l1.8 4.9L18 9l-4.2 1.9L12 16l-1.8-5.1L6 9l4.2-1.1L12 3z M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z",
};

export function CategoryIcon({ icon, className = "h-5 w-5" }: { icon: string; className?: string }) {
  const d = paths[icon] ?? paths.sparkles;
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
