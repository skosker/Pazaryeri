import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/user-avatar";
import { THREAD_PAGE_SIZE, toThreadMessage } from "@/lib/messaging";
import { MessageThread } from "./message-thread";

const partySelect = {
  id: true,
  name: true,
  image: true,
  title: true,
  role: true,
  synthetic: true,
  suspended: true,
} as const;

export default async function ConversationPage(props: PageProps<"/panel/mesajlar/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const viewer = await activeUser();
  if (!viewer) redirect(`/giris?callbackUrl=/panel/mesajlar/${id}`);

  const conversation = await prisma.conversation.findFirst({
    where: { id, OR: [{ buyerId: viewer.id }, { sellerId: viewer.id }] },
    include: { buyer: { select: partySelect }, seller: { select: partySelect } },
  });
  if (!conversation) notFound();

  const viewerIsBuyer = conversation.buyerId === viewer.id;
  const other = viewerIsBuyer ? conversation.seller : conversation.buyer;

  const [latest] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "desc" },
      take: THREAD_PAGE_SIZE,
    }),
    prisma.conversation.update({
      where: { id },
      data: viewerIsBuyer ? { buyerLastReadAt: new Date() } : { sellerLastReadAt: new Date() },
    }),
  ]);
  const messages = latest.reverse().map(toThreadMessage);

  const cannotSendReason =
    other.suspended || other.synthetic ? "Bu kullanıcıya şu an mesaj gönderilemiyor." : null;

  return (
    <div>
      <Link href="/panel/mesajlar" className="text-sm text-slate-400 hover:text-brand-navy">
        ← Mesajlar
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <UserAvatar name={other.name} image={other.image} className="h-11 w-11 text-base" />
        <div className="min-w-0">
          {other.role === "FREELANCER" ? (
            <Link
              href={`/freelancer/${other.id}`}
              className="font-semibold text-brand-navy hover:text-purple-700 hover:underline"
            >
              {other.name}
            </Link>
          ) : (
            <p className="font-semibold text-brand-navy">{other.name}</p>
          )}
          <p className="truncate text-xs text-slate-400">
            {viewerIsBuyer ? other.title ?? "Freelancer" : "Alıcı"}
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
        Güvenliğin için iletişimi ve ödemeleri Prosinta üzerinden yürüt. Telefon, e-posta, IBAN ve
        mesajlaşma uygulaması bağlantıları mesajlarda otomatik olarak gizlenir.
      </p>

      <div className="mt-4">
        <MessageThread
          conversationId={conversation.id}
          viewerId={viewer.id}
          initialMessages={messages}
          cannotSendReason={cannotSendReason}
          maskedNotice={searchParams.gizlendi === "1"}
        />
      </div>
    </div>
  );
}
