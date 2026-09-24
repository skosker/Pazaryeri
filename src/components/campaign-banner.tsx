import Link from "next/link";

/** Thin strip above the header while a seasonal campaign is live. */
export function CampaignBanner({ name }: { name: string }) {
  return (
    <Link
      href="/kampanya"
      className="block bg-gradient-to-r from-rose-600 via-fuchsia-600 to-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:opacity-95"
    >
      {name} başladı! İndirimli hizmetleri gör →
    </Link>
  );
}
