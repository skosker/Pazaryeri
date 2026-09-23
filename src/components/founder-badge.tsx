/**
 * Kalıcı "Kurucu Freelancer" rozeti — ilk gerçek freelancer'lara verilir. Sıra numarası
 * bilerek gösterilmiyor: kaçıncı olduğu, platformda kaç gerçek freelancer olduğunu ele verir.
 */
export function FounderBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      title="Prosinta'nın ilk freelancer'larından"
      className={`inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 font-bold uppercase tracking-wide text-white ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
    >
      <svg className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path d="M10 1l2.4 5.9L18.5 7l-4.7 4 1.5 6.2L10 14l-5.3 3.2 1.5-6.2-4.7-4 6.1-.1L10 1z" />
      </svg>
      {compact ? "Kurucu" : "Kurucu Freelancer"}
    </span>
  );
}
