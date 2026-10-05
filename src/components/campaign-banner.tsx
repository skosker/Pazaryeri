import Link from "next/link";

/**
 * Thin strip above the header while a seasonal campaign is live. While no gig has joined
 * yet, a campaign with membership/Öne Çıkar perks points at those instead of an empty
 * campaign page.
 */
export function CampaignBanner({ name, perkText }: { name: string; perkText: string | null }) {
  const perksOnly = perkText !== null;
  return (
    <Link
      href={perksOnly ? "/uyelik" : "/kampanya"}
      className="block bg-gradient-to-r from-rose-600 via-fuchsia-600 to-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:opacity-95 print:hidden"
    >
      {perksOnly ? `${name}: Freelancer'lara ${perkText}! Paketleri Gör →` : `${name} başladı! İndirimli hizmetleri gör →`}
    </Link>
  );
}
