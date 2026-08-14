// Duotone icon set: an optional soft-filled base shape carries the category's
// accent colour, and a crisp stroke on top keeps the glyph readable down to 14px.
const paths: Record<string, { soft?: string; stroke: string }> = {
  cpu: {
    soft: "M9.5 9.5h5v5h-5z",
    stroke:
      "M6.5 4.5h11a2 2 0 012 2v11a2 2 0 01-2 2h-11a2 2 0 01-2-2v-11a2 2 0 012-2z M9.5 9.5h5v5h-5z M9.5 1.5v3 M14.5 1.5v3 M9.5 19.5v3 M14.5 19.5v3 M1.5 9.5h3 M1.5 14.5h3 M19.5 9.5h3 M19.5 14.5h3",
  },
  code: {
    stroke: "M8.5 17.5L3 12l5.5-5.5 M15.5 6.5L21 12l-5.5 5.5 M13.8 4l-3.6 16",
  },
  palette: {
    soft: "M8 13.4a1.4 1.4 0 110-2.8 1.4 1.4 0 010 2.8z M11 9a1.4 1.4 0 110-2.8A1.4 1.4 0 0111 9z M15.4 10.2a1.4 1.4 0 110-2.8 1.4 1.4 0 010 2.8z",
    stroke:
      "M12 3.2c-5 0-9 3.6-9 8.4 0 4.7 4 8.4 9 8.4 1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8h1.6c2.7 0 4.8-2.2 4.8-4.8 0-3.9-3.9-6.9-9-6.9z",
  },
  megaphone: {
    soft: "M18 6.5v11l-9-3.2V9.7z",
    stroke:
      "M18 6.5v11l-9-3.2H5.5A1.5 1.5 0 014 12.8v-1.6A1.5 1.5 0 015.5 9.7H9z M7.5 14.4l1.6 4.4a1 1 0 00.95.7h1.05a.8.8 0 00.75-1.07l-1.4-4.03 M20.6 10.2a3 3 0 010 3.6",
  },
  chart: {
    soft: "M6 13h2.4v6H6z M10.8 9h2.4v10h-2.4z M15.6 5h2.4v14h-2.4z",
    stroke: "M3.5 3.5v17h17 M6 13h2.4v6H6z M10.8 9h2.4v10h-2.4z M15.6 5h2.4v14h-2.4z",
  },
  briefcase: {
    soft: "M3 11.5h18V18a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    stroke:
      "M5 7h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z M9 7V5.2A1.2 1.2 0 0110.2 4h3.6A1.2 1.2 0 0115 5.2V7 M3 11.5h18",
  },
  pen: {
    soft: "M15.4 5.3l3.3 3.3-2 2-3.3-3.3z",
    stroke: "M4 20h4L19 9a2.35 2.35 0 00-3.3-3.3L4.7 16.7z M13.4 7.3l3.3 3.3",
  },
  video: {
    soft: "M4 6.5h10.5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-7a2 2 0 012-2z",
    stroke:
      "M4 6.5h10.5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-7a2 2 0 012-2z M16.5 10.6l4.2-2.6a.6.6 0 01.9.5v7a.6.6 0 01-.9.5l-4.2-2.6z",
  },
  book: {
    soft: "M12 3.5L2.5 8.2 12 12.9l9.5-4.7z",
    stroke:
      "M12 3.5L2.5 8.2 12 12.9l9.5-4.7z M6.5 10.6v4.6c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-4.6 M21.5 8.2v6",
  },
  music: {
    soft: "M6 20.5a2.6 2.6 0 110-5.2 2.6 2.6 0 010 5.2z M18.5 18.4a2.6 2.6 0 110-5.2 2.6 2.6 0 010 5.2z",
    stroke:
      "M8.6 17.9V5.6l12.5-2.1v12.2 M8.6 9.7l12.5-2.1 M6 20.5a2.6 2.6 0 110-5.2 2.6 2.6 0 010 5.2z M18.5 18.4a2.6 2.6 0 110-5.2 2.6 2.6 0 010 5.2z",
  },
  sparkles: {
    soft: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z",
    stroke:
      "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z M18.4 15l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z",
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
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {p.soft && <path d={p.soft} fill="currentColor" stroke="none" opacity={0.25} />}
      <path d={p.stroke} />
    </svg>
  );
}
