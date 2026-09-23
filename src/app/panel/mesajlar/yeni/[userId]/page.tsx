import Link from "next/link";
import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/user-avatar";
import { resolvePair } from "@/lib/messaging";
import { ComposeForm } from "./compose-form";

function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Where "Mesaj Gönder" leads. Goes straight to the thread when the pair already has one;
 * otherwise shows an empty composer, so a thread only exists once it has a message in it.
 */
export default async function NewConversationPage(props: PageProps<"/panel/mesajlar/yeni/[userId]">) {
  const { userId } = await props.params;
  const searchParams = await props.searchParams;
  const gigSlug = toSingle(searchParams.ilan);
  const orderId = toSingle(searchParams.siparis);

  const viewer = await activeUser();
  if (!viewer) redirect(`/giris?callbackUrl=${encodeURIComponent(`/panel/mesajlar/yeni/${userId}`)}`);

  const pair = await resolvePair(viewer.id, userId, orderId);
  if ("error" in pair) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">{pair.error}</p>
        <Link href="/panel/mesajlar" className="mt-4 inline-block text-sm font-semibold text-purple-700 hover:underline">
          Mesajlara Dön
        </Link>
      </div>
    );
  }

  const existing = await prisma.conversation.findUnique({
    where: { buyerId_sellerId: pair },
    select: { id: true },
  });
  if (existing) redirect(`/panel/mesajlar/${existing.id}`);

  const other = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, image: true, title: true, role: true },
  });

  let prefill = "";
  if (gigSlug) {
    const gig = await prisma.gig.findUnique({ where: { slug: gigSlug }, select: { title: true, sellerId: true } });
    if (gig && gig.sellerId === pair.sellerId) prefill = `Merhaba, "${gig.title}" ilanınız hakkında bir sorum var: `;
  }

  return (
    <div>
      <Link href="/panel/mesajlar" className="text-sm text-slate-400 hover:text-brand-navy">
        ← Mesajlar
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">Yeni Mesaj</h1>

      <div className="mt-5 flex items-center gap-3">
        <UserAvatar name={other.name} image={other.image} className="h-11 w-11 text-base" />
        <div>
          <p className="font-semibold text-brand-navy">{other.name}</p>
          <p className="text-xs text-slate-400">
            {other.role === "FREELANCER" && pair.sellerId === userId ? other.title ?? "Freelancer" : "Alıcı"}
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
        Güvenliğin için iletişimi ve ödemeleri Prosinta üzerinden yürüt. Telefon, e-posta, IBAN ve
        mesajlaşma uygulaması bağlantıları mesajlarda otomatik olarak gizlenir.
      </p>

      <div className="mt-4">
        <ComposeForm otherId={userId} orderId={orderId ?? null} prefill={prefill} />
      </div>
    </div>
  );
}
