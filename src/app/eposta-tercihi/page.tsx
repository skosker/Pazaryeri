import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EMAIL_KIND_FIELD, EMAIL_KIND_LABEL, parseEmailKind, verifyUnsubscribeToken } from "@/lib/email-preferences";
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
  const kind = parseEmailKind(searchParams.tur);
  const valid = userId !== "" && verifyUnsubscribeToken(userId, token, kind);
  const user = valid
    ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true, campaignEmails: true, jobRequestEmails: true } })
    : null;
  const subscribed = user ? user[EMAIL_KIND_FIELD[kind]] : false;
  const what = kind === "kampanya" ? "kampanya ve fırsat duyurusu" : "yeni iş talebi özeti";

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-brand-navy">{EMAIL_KIND_LABEL[kind]}</h1>
        {!user ? (
          <p className="mt-3 text-sm text-slate-600">
            Bağlantı geçersiz. Tercihini Panel → Profilim sayfasından değiştirebilirsin.
          </p>
        ) : !subscribed ? (
          <p className="mt-3 text-sm text-slate-600">
            <strong>{user.email}</strong> adresine artık {what} göndermeyeceğiz. Sipariş ve hesap
            e-postaların gelmeye devam eder. Fikrini değiştirirsen Panel → Profilim&apos;den yeniden açabilirsin.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-600">
              <strong>{user.email}</strong> adresine {what} göndermeyi bırakalım mı? Sipariş ve hesap
              e-postaların gelmeye devam eder.
            </p>
            <form action={unsubscribeAction.bind(null, userId, token, kind)} className="mt-6">
              <button
                type="submit"
                className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                {kind === "kampanya" ? "Duyuruları" : "Özetleri"} Almak İstemiyorum
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
