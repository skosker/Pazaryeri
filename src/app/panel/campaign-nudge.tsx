"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

export type CampaignNudgeData = {
  id: string;
  name: string;
  live: boolean;
  /** "19 Ekim" (start while upcoming) */
  startLabel: string;
  daysLeft: number;
  gigCount: number;
  joinedCount: number;
  proDiscountPercent: number;
  boostDiscountPercent: number;
};

const storageKey = (id: string) => `kampanya-uyarisi-kapali:${id}`;

// "Kapat" is remembered per campaign in this browser. Read through useSyncExternalStore so
// the server render and the first client render agree (hidden), then the stored choice wins.
const listeners = new Set<() => void>();
const closedThisVisit = new Set<string>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
function isClosed(id: string): boolean {
  try {
    return window.localStorage.getItem(storageKey(id)) === "1";
  } catch {
    return false; // Storage unavailable (private window, blocked): just show it.
  }
}
function close(id: string) {
  try {
    window.localStorage.setItem(storageKey(id), "1");
  } catch {
    // Nothing to remember it in; it hides for this page view below anyway.
  }
  closedThisVisit.add(id);
  listeners.forEach((l) => l());
}

/**
 * Top of the freelancer panel while a campaign takes entries and some of their approved
 * gigs are not in it yet. Not shown on the Kampanyalar page itself; "Kapat" hides it for
 * that campaign in this browser.
 */
export function CampaignNudge({ campaign: c }: { campaign: CampaignNudgeData }) {
  const pathname = usePathname();
  const dismissed = useSyncExternalStore(
    subscribe,
    () => closedThisVisit.has(c.id) || isClosed(c.id),
    () => true
  );

  if (dismissed || pathname?.startsWith("/panel/kampanyalar")) return null;

  const perks = [
    c.proDiscountPercent > 0 ? `Pro üyelik %${c.proDiscountPercent} indirimli` : null,
    c.boostDiscountPercent > 0 ? `Öne Çıkar %${c.boostDiscountPercent} indirimli` : null,
  ].filter(Boolean);

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-fuchsia-600 to-indigo-600 p-5 text-white shadow-sm">
      <button
        type="button"
        onClick={() => close(c.id)}
        aria-label="Kapat"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/15 hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
      <p className="text-xs font-bold uppercase tracking-wide text-white/80">
        {c.live ? (c.daysLeft <= 1 ? "Yayında · Son gün" : `Yayında · Bitmesine ${c.daysLeft} gün`) : `Yakında · ${c.startLabel}`}
      </p>
      <p className="mt-1 pr-8 text-lg font-extrabold">
        {c.live ? `${c.name} başladı` : `${c.name} ${c.startLabel} tarihinde başlıyor`}
      </p>
      <p className="mt-1 text-sm text-white/85">
        {c.joinedCount === 0
          ? "Henüz hiçbir ilanın katılmadı. İlanlarını kendi belirlediğin indirimle ekle; kampanya boyunca rozetle ve kampanya sayfasında öne çıkar."
          : `${c.gigCount} ilanından ${c.joinedCount} tanesi katıldı. Diğerlerini de ekleyerek daha çok alıcıya görün.`}
        {perks.length > 0 && ` Kampanya süresince sana özel: ${perks.join(", ")}.`}
      </p>
      <Link
        href="/panel/kampanyalar"
        className="mt-4 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-fuchsia-700 hover:bg-white/90"
      >
        İlanlarını Ekle
      </Link>
    </div>
  );
}
