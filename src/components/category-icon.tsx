const paths: Record<string, { stroke: string; fill?: string }> = {
  palette: {
    stroke:
      "M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-.9.7-1.6 1.6-1.6H16a5 5 0 005-5c0-3.9-4-6.7-9-6.7z",
    fill: "M7.5 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3z M11 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z M15.5 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
  },
  code: { stroke: "M9 18l-6-6 6-6 M15 6l6 6-6 6" },
  pen: { stroke: "M12 20h9 M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" },
  video: {
    stroke: "M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z",
    fill: "M10 8.3l6 3.7-6 3.7z",
  },
  megaphone: { stroke: "M3 11v2a2 2 0 002 2h1l3 5V4l-3 5H5a2 2 0 00-2 2z M14 8a4 4 0 010 8 M18 5a8 8 0 010 14" },
  music: { stroke: "M9 18V5l12-2v13 M9 18a3 3 0 11-6 0 3 3 0 016 0z M21 16a3 3 0 11-6 0 3 3 0 016 0z" },
  briefcase: { stroke: "M3 7h18v13H3z M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3 M3 13h18" },
  book: { stroke: "M12 4L3 8.5l9 4.5 9-4.5z M7 10.5v4c0 1.38 2.24 2.5 5 2.5s5-1.12 5-2.5v-4 M21 8.5v5" },
  sparkles: {
    stroke:
      "M12 3l1.8 4.9L18 9l-4.2 1.9L12 16l-1.8-5.1L6 9l4.2-1.1L12 3z M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z",
  },
};

export function CategoryIcon({ icon, className = "h-5 w-5" }: { icon: string; className?: string }) {
  const p = paths[icon] ?? paths.sparkles;
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
      {p.fill && <path d={p.fill} fill="currentColor" stroke="none" />}
      <path d={p.stroke} />
    </svg>
  );
}
