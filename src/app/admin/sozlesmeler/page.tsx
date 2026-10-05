import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  DEMO_EMAIL_DOMAIN,
  TERMS_ACCEPTANCE_LABEL,
  UYELIK_SOZLESMESI_VERSION,
  termsAcceptance,
  type TermsAcceptance,
} from "@/lib/terms-acceptance";

const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

const tone: Record<TermsAcceptance["kind"], string> = {
  recorded: "bg-emerald-50 text-emerald-700",
  form: "bg-sky-50 text-sky-700",
  none: "bg-amber-50 text-amber-700",
  synthetic: "bg-slate-100 text-slate-500",
  demo: "bg-slate-100 text-slate-500",
};

/**
 * Admin → Freelancer Sözleşmeleri: every real freelancer with what is on record about the
 * Üyelik Sözleşmesi they accepted at signup, and a link to read it as accepted. Generated
 * showcase profiles are left out: nobody signed up for them.
 */
export default async function AdminAgreementsPage(props: PageProps<"/admin/sozlesmeler">) {
  const query = await props.searchParams;
  const q = typeof query.q === "string" ? query.q.trim() : "";

  // Demo/seeded accounts were made by us, not through the signup form: counted, not listed.
  const demoWhere = { email: { endsWith: DEMO_EMAIL_DOMAIN }, termsAcceptedAt: null };
  const [freelancers, syntheticCount, demoCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "FREELANCER",
        synthetic: false,
        NOT: demoWhere,
        ...(q
          ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, name: true, email: true, synthetic: true, createdAt: true, termsAcceptedAt: true, termsVersion: true },
    }),
    prisma.user.count({ where: { role: "FREELANCER", synthetic: true } }),
    prisma.user.count({ where: { role: "FREELANCER", synthetic: false, ...demoWhere } }),
  ]);
  const rows = freelancers.map((f) => ({ ...f, acceptance: termsAcceptance(f) }));
  const count = (kind: TermsAcceptance["kind"]) => rows.filter((r) => r.acceptance.kind === kind).length;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Freelancer Sözleşmeleri</h1>
          <p className="mt-1 text-sm text-slate-500">
            Freelancer&apos;ların kayıt olurken onayladığı Üyelik Sözleşmesi ve onay kayıtları. Güncel sürüm:{" "}
            {UYELIK_SOZLESMESI_VERSION}.
          </p>
        </div>
        <Link href="/uyelik-sozlesmesi" target="_blank" className="text-sm font-semibold text-purple-700 hover:underline">
          Sitedeki Metin ↗
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Freelancer", rows.length],
          [TERMS_ACCEPTANCE_LABEL.recorded, count("recorded")],
          [TERMS_ACCEPTANCE_LABEL.form, count("form")],
          [TERMS_ACCEPTANCE_LABEL.none, count("none")],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-bold text-brand-navy">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
        <p>
          <span className={`mr-1.5 rounded-full px-2 py-0.5 font-semibold ${tone.recorded}`}>{TERMS_ACCEPTANCE_LABEL.recorded}</span>
          Onay anı ve onaylanan sürüm kayıtlı.
        </p>
        <p>
          <span className={`mr-1.5 rounded-full px-2 py-0.5 font-semibold ${tone.form}`}>{TERMS_ACCEPTANCE_LABEL.form}</span>
          Hesap, kayıt formunun onay kutusu zorunlu olduğu dönemde (18 Eylül 2026 sonrası) açıldı; kayıt formuyla
          açıldıysa sözleşme onaylanmıştır, ancak onay anı ayrıca saklanmıyordu.
        </p>
        <p>
          <span className={`mr-1.5 rounded-full px-2 py-0.5 font-semibold ${tone.none}`}>{TERMS_ACCEPTANCE_LABEL.none}</span>
          Hesap, kayıtta onay zorunlu olmadan önce açıldı.
        </p>
        {(syntheticCount > 0 || demoCount > 0) && (
          <p className="pt-1 text-slate-400">
            Listelenmeyenler: sistemin ürettiği {syntheticCount.toLocaleString("tr-TR")} vitrin profili ve{" "}
            {demoCount.toLocaleString("tr-TR")} demo hesap ({DEMO_EMAIL_DOMAIN}). Bu hesaplar kayıt formuyla açılmadığı için
            sözleşme onayları yoktur.
          </p>
        )}
      </div>

      <form className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Ad veya e-posta ara"
          className="w-full max-w-sm rounded-full border border-slate-200 bg-white px-4 py-2 text-sm focus:border-purple-400 focus:outline-none"
        />
        <button className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white">Ara</button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          {q ? "Aramaya uyan freelancer yok." : "Henüz freelancer yok."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Freelancer</th>
                <th className="px-4 py-3 font-medium">Kayıt</th>
                <th className="px-4 py-3 font-medium">Sözleşme</th>
                <th className="px-4 py-3 font-medium">Onay</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const a = r.acceptance;
                return (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/admin/kullanicilar/${r.id}`} className="font-semibold text-brand-navy hover:underline">
                        {r.name}
                      </Link>
                      <p className="text-xs text-slate-400">{r.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{dateTimeFmt.format(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone[a.kind]}`}>
                        {TERMS_ACCEPTANCE_LABEL[a.kind]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {a.kind === "recorded"
                        ? `${dateTimeFmt.format(a.at)}${a.version ? ` · Sürüm ${a.version}` : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/sozlesmeler/${r.id}`} className="whitespace-nowrap text-xs font-semibold text-purple-700 hover:underline">
                        Görüntüle →
                      </Link>
                    </td>
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
