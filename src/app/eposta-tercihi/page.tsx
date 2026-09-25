import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email-preferences";
import { unsubscribeAction } from "./actions";

export const metadata: Metadata = { title: "E-posta Tercihi", robots: { index: false } };

/**
 * Where the "almak istemiyorum" link in announcement e-mails lands. It asks for a click
 * rather than unsubscribing on arrival: mail scanners open links, and must not switch
 * people's e-mails off by doing so.
 */
export default async function EmailPreferencePage(props: PageProps<"/eposta-tercihi">) {
  const searchParams = await props.searchParams;
  const userId = typeof searchParams.u === "string" ? searchParams.u : "";
  const token = typeof searchParams.t === "string" ? searchParams.t : "";
  const valid = userId !== "" && verifyUnsubscribeToken(userId, token);
  const user = valid
    ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true, campaignEmails: true } })
    : null;

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-brand-navy">Kampanya Duyuruları</h1>
        {!user ? (
          <p className="mt-3 text-sm text-slate-600">
            Bağlantı geçersiz. Tercihini Panel → Profilim sayfasından değiştirebilirsin.
          </p>
        ) : !user.campaignEmails ? (
          <p className="mt-3 text-sm text-slate-600">
            <strong>{user.email}</strong> adresine artık kampanya duyurusu göndermeyeceğiz. Sipariş ve hesap
            e-postaların gelmeye devam eder. Fikrini değiştirirsen Panel → Profilim&apos;den yeniden açabilirsin.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-600">
              <strong>{user.email}</strong> adresine kampanya ve fırsat duyurusu göndermeyi bırakalım mı? Sipariş ve hesap
              e-postaların gelmeye devam eder.
            </p>
            <form action={unsubscribeAction.bind(null, userId, token)} className="mt-6">
              <button
                type="submit"
                className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Duyuruları Almak İstemiyorum
              </button>
            </form>
          </>
        )}
        <Link href="/" className="mt-6 inline-block text-sm text-slate-500 hover:text-brand-navy">
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
