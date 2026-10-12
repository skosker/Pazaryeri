import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { TEST_EMAIL_DOMAIN } from "@/lib/test-accounts";
import { TestAccountsForm } from "./test-accounts-form";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
const roleLabel: Record<string, string> = { BUYER: "Alıcı", FREELANCER: "Freelancer", ADMIN: "Admin" };

export default async function TestAccountsPage() {
  await requireAdmin();
  const accounts = await prisma.user.findMany({
    where: { email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } },
    select: { id: true, name: true, email: true, role: true, isTester: true, suspended: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <Link href="/admin/kullanicilar" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
        ← Kullanıcılar
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">Toplu Test Hesabı</h1>
      <p className="mt-1 max-w-3xl text-sm text-slate-500">
        Test firması için isimleri yapıştır; her kişiye <span className="font-mono">ad.soyad@{TEST_EMAIL_DOMAIN}</span>{" "}
        adresiyle, e-postası doğrulanmış bir <strong>Test Hesabı</strong> açılır ve şifresi bir kez gösterilir. Bu adreslere
        e-posta gönderilmez. Test hesapları üretilmiş ilanlardan test siparişi verebilir; Pro üyeliği denemek için
        panelden &quot;Freelancer Ol&quot; adımıyla freelancer olurlar.
      </p>

      <div className="mt-6">
        <TestAccountsForm />
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
                <th className="px-4 py-3 font-medium">Açılış</th>
                <th className="px-4 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/kullanicilar/${a.id}`} className="font-semibold text-brand-navy hover:text-purple-700">
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{a.email}</td>
                  <td className="px-4 py-3 text-slate-600">{roleLabel[a.role] ?? a.role}</td>
                  <td className="px-4 py-3 text-slate-500">{dateFmt.format(a.createdAt)}</td>
                  <td className="px-4 py-3">
                    {a.suspended ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Askıda</span>
                    ) : a.isTester ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Test Hesabı</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Test işareti kaldırıldı</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
