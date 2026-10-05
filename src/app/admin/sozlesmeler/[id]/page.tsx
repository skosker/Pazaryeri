import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { formatPrice } from "@/lib/format-price";
import { PURCHASE_PLAN_LABEL } from "@/lib/membership";
import { legalProseClass } from "@/components/legal-prose";
import { UyelikSozlesmesiText } from "@/components/legal-texts";
import {
  TERMS_ACCEPTANCE_LABEL,
  TERMS_CHECKBOX_TEXT,
  UYELIK_SOZLESMESI_VERSION,
  termsAcceptance,
} from "@/lib/terms-acceptance";
import { PrintButton } from "./print-button";

const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});
const roleLabel: Record<string, string> = { FREELANCER: "Freelancer (Hizmet Sağlayıcı)", BUYER: "Alıcı", ADMIN: "Admin" };
const periodLabel = (months: number | null) => (months === 12 ? "Yıllık" : months === 1 ? "Aylık" : "Süresiz");

/**
 * One user's Üyelik Sözleşmesi as it stands on record: the parties, what is known about
 * their electronic acceptance, the paid-service contracts they accepted at checkout, and
 * the agreement's text. Printable for a bank or an auditor.
 */
export default async function AdminAgreementPage(props: PageProps<"/admin/sozlesmeler/[id]">) {
  const { id } = await props.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, synthetic: true, createdAt: true,
      termsAcceptedAt: true, termsVersion: true,
      proPurchases: {
        where: { termsAcceptedAt: { not: null } },
        orderBy: { termsAcceptedAt: "desc" },
        select: { id: true, plan: true, months: true, amount: true, status: true, termsAcceptedAt: true },
      },
      gigBoosts: {
        where: { termsAcceptedAt: { not: null } },
        orderBy: { termsAcceptedAt: "desc" },
        select: { id: true, days: true, amount: true, status: true, termsAcceptedAt: true, gig: { select: { title: true } } },
      },
    },
  });
  if (!user) notFound();
  const a = termsAcceptance(user);

  const paid = [
    ...user.proPurchases.map((p) => ({
      id: p.id,
      at: p.termsAcceptedAt!,
      service: `Prosinta ${PURCHASE_PLAN_LABEL[p.plan]} ${p.plan.startsWith("KURUMSAL") ? "paket" : "üyelik"} · ${periodLabel(p.months)}`,
      amount: Number(p.amount),
      paidOk: p.status === "SUCCESS",
    })),
    ...user.gigBoosts.map((b) => ({
      id: b.id,
      at: b.termsAcceptedAt!,
      service: `Öne Çıkar (${b.days} gün) · ${b.gig.title}`,
      amount: Number(b.amount),
      paidOk: b.status === "SUCCESS",
    })),
  ].sort((x, y) => y.at.getTime() - x.at.getTime());

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/sozlesmeler" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
          ← Freelancer Sözleşmeleri
        </Link>
        <PrintButton />
      </div>

      <h1 className="mt-4 text-2xl font-bold text-brand-navy">Üyelik Sözleşmesi</h1>
      <p className="mt-1 text-sm text-slate-500">
        {COMPANY.name} ile {user.name} arasında elektronik ortamda kurulan sözleşme.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Şirket</h2>
          <p className="mt-2 font-semibold text-brand-navy">{COMPANY.name}</p>
          <p className="text-slate-600">{COMPANY.address}</p>
          <p className="text-slate-600">
            Ticaret Sicil No: {COMPANY.tradeRegistry} · {COMPANY.taxOffice} V.D. {COMPANY.taxNumber}
          </p>
          <p className="text-slate-600">{COMPANY.email}</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Kullanıcı</h2>
          <p className="mt-2 font-semibold text-brand-navy">{user.name}</p>
          <p className="text-slate-600">{user.email}</p>
          <p className="text-slate-600">{roleLabel[user.role] ?? user.role}</p>
          <p className="text-slate-600">Kayıt: {dateTimeFmt.format(user.createdAt)}</p>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-brand-navy">Elektronik Onay</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {TERMS_ACCEPTANCE_LABEL[a.kind]}
          </span>
        </div>
        <p className="mt-2 leading-relaxed text-slate-600">
          {a.kind === "recorded" && (
            <>
              Kayıt formundaki “{TERMS_CHECKBOX_TEXT}” kutusu işaretlenerek <strong>{dateTimeFmt.format(a.at)}</strong>{" "}
              tarihinde onaylandı. Onaylanan sürüm: <strong>{a.version ?? "kayıtlı değil"}</strong>.
            </>
          )}
          {a.kind === "form" && (
            <>
              Hesap <strong>{dateTimeFmt.format(a.at)}</strong> tarihinde açıldı. Kayıt formu 18 Eylül 2026&apos;dan beri
              “{TERMS_CHECKBOX_TEXT}” kutusu işaretlenmeden gönderilemiyor; hesap kayıt formuyla açıldıysa sözleşme
              onaylanmıştır. Onay anı, onay kayıtları tutulmaya başlamadan önce açılan bu hesap için ayrıca saklanmadı. O
              tarihte yürürlükteki metin aşağıdaki güncel metinden farklı olabilir.
            </>
          )}
          {a.kind === "none" && (
            <>
              Hesap <strong>{dateTimeFmt.format(a.at)}</strong> tarihinde, kayıtta sözleşme onayı zorunlu hâle gelmeden önce
              açıldı; bu hesap için elektronik onay kaydı bulunmuyor.
            </>
          )}
          {a.kind === "synthetic" && <>Bu hesap sistemin ürettiği bir vitrin profilidir; kayıt olunmadığı için sözleşme onayı yoktur.</>}
          {a.kind === "demo" && <>Bu bir demo hesaptır; kayıt formuyla açılmadığı için sözleşme onayı yoktur.</>}
        </p>
      </section>

      {paid.length > 0 && (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
          <h2 className="font-semibold text-brand-navy">Ücretli Hizmet Sözleşmeleri</h2>
          <p className="mt-1 text-xs text-slate-500">
            Ön Bilgilendirme Formu ve Mesafeli Hizmet Sözleşmesi, ödeme sayfasında onay kutusuyla kabul edildi.
          </p>
          <table className="mt-3 w-full text-left">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2 pr-3 font-medium">Onay</th>
                <th className="py-2 pr-3 font-medium">Hizmet</th>
                <th className="py-2 pr-3 text-right font-medium">Tutar</th>
                <th className="py-2 font-medium">Ödeme</th>
              </tr>
            </thead>
            <tbody>
              {paid.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="whitespace-nowrap py-2 pr-3 text-slate-600">{dateTimeFmt.format(p.at)}</td>
                  <td className="py-2 pr-3 text-slate-700">{p.service}</td>
                  <td className="whitespace-nowrap py-2 pr-3 text-right text-slate-700">{formatPrice(p.amount)} TL</td>
                  <td className="py-2 text-xs text-slate-500">{p.paidOk ? "Ödendi" : "Ödenmedi"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-brand-navy">Sözleşme Metni</h2>
        <p className="mt-1 text-xs text-slate-400">Güncel sürüm · Son güncelleme: {UYELIK_SOZLESMESI_VERSION}</p>
        <div className={`mt-4 rounded-2xl border border-slate-200 bg-white p-6 ${legalProseClass}`}>
          <UyelikSozlesmesiText />
        </div>
      </section>
    </div>
  );
}
