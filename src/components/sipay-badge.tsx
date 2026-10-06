/** Havale/EFT payments are taken through Sipay's EFT/FAST infrastructure (merchant agreement). */
export function SipayBadge() {
  return (
    <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
      Havale/EFT altyapısı
      <span className="inline-flex items-center rounded-md bg-brand-navy px-2 py-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG logo; next/image's
            optimizer offers nothing for a vector file. */}
        <img src="/sipay-logo-white.svg" alt="Sipay" className="h-3.5 w-auto" />
      </span>
    </p>
  );
}
