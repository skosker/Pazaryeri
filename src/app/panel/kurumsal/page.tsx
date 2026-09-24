import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { corporateAccount, monthlySpending } from "@/lib/corporate";
import { getBankAccounts } from "@/lib/bank-transfer";
import { formatPrice } from "@/lib/format-price";
import { TopUpForm } from "./top-up-form";
import { CORP_PLAN_LABEL, corpPerks, corporatePlanState } from "@/lib/corporate-plans";
import { untilFormat } from "@/lib/membership";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "Europe/Istanbul" });
const statusLabel = { INITIALIZED: "Onay bekliyor", SUCCESS: "Yüklendi", FAILED: "Reddedildi" } as const;

export default async function CorporateAccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/kurumsal");
  const account = await corporateAccount(session.user.id);
  if (!account.enabled) notFound();

  if (!account.isCorporate) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-brand-navy">Kurumsal Hesap</h1>
        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Toplu bakiye yüklemek için önce{" "}
          <Link href="/panel/profil" className="font-semibold text-purple-700 hover:underline">
            Profilim → Fatura Bilgileri
          </Link>{" "}
          bölümünden şirket bilgilerini gir.
        </p>
      </div>
    );
  }

  const [topUps, entries, bankAccounts, plan] = await Promise.all([
    prisma.balanceTopUp.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.balanceEntry.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    getBankAccounts(),
    corporatePlanState(session.user.id),
  ]);
  const months = monthlySpending(entries);
  const perks = corpPerks(plan.tier, plan.settings);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-navy">Kurumsal Hesap</h1>
      <p className="mt-1 text-sm text-slate-500">{account.companyName}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:col-span-1">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Bakiye</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{formatPrice(account.balance)} TL</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 sm:col-span-2">
          Bakiyen, siparişlerin ödeme sayfasında <strong>Kurumsal Bakiye ile Öde</strong> seçeneğiyle harcanır; tüm
          harcamaların aylık olarak aşağıda listelenir.
          {account.bonusPercent > 0 && (
            <p className="mt-2 font-semibold text-emerald-700">
              Her yüklemeye %{account.bonusPercent.toLocaleString("tr-TR")} bonus eklenir.
            </p>
          )}
        </div>
      </div>

      {plan.open && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-200 bg-purple-50 p-5 text-sm">
          <div>
            <p className="font-semibold text-brand-navy">
              {plan.tier ? `${CORP_PLAN_LABEL[plan.tier]} Paket` : "Temel Paket"}
              {plan.until && (
                <span className="font-normal text-slate-500"> · {untilFormat.format(plan.until)} tarihine kadar</span>
              )}
            </p>
            <p className="mt-0.5 text-slate-600">
              {plan.tier
                ? `Siparişlerde %${perks.orderPercent.toLocaleString("tr-TR")} indirim (ayda en fazla ${formatPrice(perks.orderMaxTl)} TL), yüklemelerde %${perks.bonusPercent.toLocaleString("tr-TR")} bonus.`
                : "Paket alarak siparişlerinde indirim ve bakiye yüklemelerinde bonus kazan."}
            </p>
          </div>
          <Link
            href="/panel/kurumsal/paketler"
            className="brand-gradient rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {plan.tier ? "Paketimi Yönet" : "Paketleri İncele"}
          </Link>
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-brand-navy">Bakiye Yükle</h2>
        <p className="mt-1 text-sm text-slate-500">
          Aşağıdaki hesaba en az {formatPrice(account.minTopUp)} TL havale/EFT yap, sonra tutarı girip bildir. Açıklamaya
          şirket unvanını yazman yeterli.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {bankAccounts.map((b) => (
            <li key={b.id}>
              <span className="font-medium text-brand-navy">{b.bankName}</span> · {b.accountHolder} ·{" "}
              <span className="font-mono">{b.iban}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <TopUpForm minTopUp={account.minTopUp} />
        </div>
        {topUps.length > 0 && (
          <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100 text-sm">
            {topUps.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2">
                <span className="text-slate-500">{dateFmt.format(t.createdAt)}</span>
                <span className="font-semibold text-brand-navy">
                  {formatPrice(t.amount)} TL{Number(t.bonus) > 0 && ` + ${formatPrice(t.bonus)} TL bonus`}
                </span>
                <span className="text-xs text-slate-500">{statusLabel[t.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-brand-navy">Aylık Harcama Özeti</h2>
          {months.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Henüz bakiyeyle ödenmiş sipariş yok.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {months.map((m) => (
                <li key={m.label} className="flex justify-between">
                  <span className="text-slate-600">
                    {m.label} <span className="text-slate-400">({m.count} sipariş)</span>
                  </span>
                  <span className="font-semibold text-brand-navy">{formatPrice(m.total)} TL</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-brand-navy">Hesap Hareketleri</h2>
          {entries.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Henüz hareket yok.</p>
          ) : (
            <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto text-sm">
              {entries.map((e) => (
                <li key={e.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-slate-600">
                    {dateFmt.format(e.createdAt)} · {e.note ?? (e.kind === "ORDER" ? "Sipariş" : "Yükleme")}
                  </span>
                  <span className={`shrink-0 font-semibold ${Number(e.amount) < 0 ? "text-brand-navy" : "text-emerald-700"}`}>
                    {Number(e.amount) > 0 ? "+" : "−"}
                    {formatPrice(Math.abs(Number(e.amount)))} TL
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
