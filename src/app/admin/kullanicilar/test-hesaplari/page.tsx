import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { TEST_EMAIL_DOMAIN } from "@/lib/test-accounts";
import { hasPaidPeriod, membershipSelect, membershipTier, untilFormat } from "@/lib/membership";
import { TestAccountsForm } from "./test-accounts-form";
import { TestTransfersForm } from "./test-transfers-form";
import { LoginLinkButton } from "./login-link-button";
import { BulkLoginLinks } from "./bulk-login-links";
import { TestPricesForm } from "./test-prices-form";
import { SampleDataButton } from "./sample-data-button";
import { TestCorporateForm } from "./test-corporate-form";
import { MembershipForm, RoleForm } from "../account-forms";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

export default async function TestAccountsPage() {
  await requireAdmin();
  const accounts = await prisma.user.findMany({
    where: { email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } },
    select: { id: true, name: true, email: true, role: true, isTester: true, suspended: true, createdAt: true, ...membershipSelect },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const waiting = new Set(
    (
      await prisma.proPurchase.findMany({
        where: { userId: { in: accounts.map((a) => a.id) }, provider: "havale", status: "INITIALIZED", plan: { in: ["PRO", "PRO_PLUS"] } },
        select: { userId: true },
      })
    ).map((p) => p.userId)
  );

  return (
    <div>
      <Link href="/admin/kullanicilar" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
        ← Kullanıcılar
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">Toplu Test Hesabı</h1>
      <p className="mt-1 max-w-3xl text-sm text-slate-500">
        Test firması için isimleri yapıştır; her kişiye <span className="font-mono">ad.soyad@{TEST_EMAIL_DOMAIN}</span>{" "}
        adresiyle, e-postası doğrulanmış bir <strong>Test Hesabı</strong> açılır ve şifresi bir kez gösterilir. Bu adreslere
        e-posta gönderilmez. Test hesapları üretilmiş ilanlardan test siparişi verebilir. Aşağıdaki listeden rolünü
        (Alıcı / Freelancer) ve freelancer üyeliğini (Pro / Pro Plus) değiştirebilirsin; rol değişikliği, kullanıcı çıkış
        yapıp yeniden girdiğinde geçerli olur. Şifresiz denemek için satırdaki <strong>Giriş Linki</strong>&apos;ni kopyalayıp
        gizli pencerede aç; link tek kullanımlık ve 10 dakika geçerlidir.
      </p>

      <div className="mt-6">
        <TestAccountsForm />
      </div>

      {accounts.some((a) => a.isTester) && (
        <div className="mt-6">
          <BulkLoginLinks />
        </div>
      )}

      {accounts.some((a) => a.isTester) && (
        <div className="mt-6">
          <TestTransfersForm
            accounts={accounts.filter((a) => a.isTester && !a.suspended).map((a) => ({ id: a.id, name: a.name, waiting: waiting.has(a.id) }))}
          />
        </div>
      )}

      {accounts.some((a) => a.isTester) && (
        <div className="mt-6">
          <SampleDataButton />
        </div>
      )}

      {accounts.some((a) => a.isTester) && (
        <div className="mt-6">
          <TestCorporateForm accounts={accounts.filter((a) => a.isTester && !a.suspended).map((a) => ({ id: a.id, name: a.name }))} />
        </div>
      )}

      <div className="mt-6">
        <TestPricesForm />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-brand-navy">Açılmış Test Hesapları ({accounts.length})</h2>
      {accounts.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">Henüz toplu açılmış test hesabı yok.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Ad Soyad</th>
                <th className="px-4 py-3 font-medium">E-posta</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Üyelik</th>
                <th className="px-4 py-3 font-medium">Açılış</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const tier = a.role === "FREELANCER" ? membershipTier(a) : null;
                return (
                  <tr key={a.id} className="border-b border-slate-50 align-top last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/admin/kullanicilar/${a.id}`} className="font-semibold text-brand-navy hover:text-purple-700">
                        {a.name}
                      </Link>
                      {a.suspended && <span className="ml-1.5 text-xs font-semibold text-red-600">Askıda</span>}
                      {!a.isTester && <span className="block text-[11px] text-slate-400">test işareti kaldırıldı</span>}
                      {a.isTester && !a.suspended && (
                        <div className="mt-1.5">
                          <LoginLinkButton userId={a.id} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{a.email}</td>
                    <td className="px-4 py-3">
                      <RoleForm userId={a.id} role={a.role} allowAdmin={false} />
                    </td>
                    <td className="px-4 py-3">
                      {a.role === "FREELANCER" ? (
                        <>
                          <p className="mb-1.5 text-xs font-semibold text-brand-navy">
                            {tier === "PRO_PLUS" ? "Pro Plus" : tier === "PRO" ? "Pro" : "Ücretsiz"}
                            {tier && (
                              <span className="font-normal text-slate-400">
                                {hasPaidPeriod(a) ? ` · bitiş ${untilFormat.format(a.proUntil!)}` : " · süresiz"}
                              </span>
                            )}
                          </p>
                          <MembershipForm userId={a.id} />
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Önce Freelancer yap</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{dateFmt.format(a.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
