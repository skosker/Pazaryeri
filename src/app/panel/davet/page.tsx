import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureReferralCode, referralSummary } from "@/lib/referrals";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format-price";
import { CopyLink } from "./copy-link";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://prosinta.com";

export default async function InvitePage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/davet");

  const [code, summary, settings] = await Promise.all([
    ensureReferralCode(session.user.id),
    referralSummary(session.user.id),
    getSettings(),
  ]);
  const link = `${appUrl}/davet/${code}`;
  const reward = formatPrice(settings.referralRewardTl);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-navy">Davet Et, Kazan</h1>
      {settings.referralEnabled ? (
        <p className="mt-1 text-sm text-slate-500">
          Arkadaşlarını Prosinta&apos;ya davet et. Davet ettiğin kişi ilk siparişini tamamladığında sana{" "}
          <strong className="text-brand-navy">{reward}₺</strong> ödül tanımlanır.
        </p>
      ) : (
        <p className="mt-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Davet programı şu an kapalı; kazandığın ödüller kullanılabilir kalır.
        </p>
      )}

      {settings.referralEnabled && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-brand-navy">Kişisel Davet Bağlantın</p>
          <CopyLink url={link} />
          <p className="mt-2 text-xs text-slate-400">Davet kodun: {code}</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Davet Ettiğin" value={String(summary.invited)} />
        <Stat label="Kazandığın Ödül" value={`${formatPrice(summary.earned)}₺`} />
        <Stat label="Kullanılabilir Ödül" value={`${formatPrice(summary.available)}₺`} highlight />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p className="font-semibold text-brand-navy">Nasıl Çalışır?</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Bağlantını paylaş; arkadaşın bu bağlantıyla kayıt olsun.</li>
          {settings.firstOrderEnabled && settings.firstOrderPercent > 0 && (
            <li>
              Arkadaşın ilk siparişinde %{settings.firstOrderPercent.toLocaleString("tr-TR")} indirim alır (en fazla{" "}
              {formatPrice(settings.firstOrderMaxTl)}₺).
            </li>
          )}
          <li>Arkadaşının ilk siparişi tamamlanınca {reward}₺ ödülün tanımlanır, sana e-posta ile haber veririz.</li>
          <li>
            Ödül, ödül tutarından yüksek bir sonraki siparişinde ödeme sayfasında otomatik düşer. Her ödül bir
            siparişte kullanılır.
          </li>
        </ol>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold ${highlight ? "text-emerald-700" : "text-brand-navy"}`}>{value}</p>
    </div>
  );
}
