import Link from "next/link";
import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/user-avatar";

const INBOX_SIZE = 50;

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

export default async function MessagesInboxPage() {
  const viewer = await activeUser();
  if (!viewer) redirect("/giris?callbackUrl=/panel/mesajlar");

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: viewer.id }, { sellerId: viewer.id }] },
    orderBy: { lastMessageAt: "desc" },
    take: INBOX_SIZE,
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true, title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, senderId: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Mesajlar</h1>
      <p className="mt-1 text-sm text-slate-500">Alıcılar ve freelancer&apos;larla yazışmaların.</p>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-sm text-slate-500">Henüz mesajın yok.</p>
          <p className="mt-1 text-sm text-slate-400">
            Bir ilanda &quot;Satıcıya Mesaj Gönder&quot; ile sipariş öncesi soru sorabilirsin.
          </p>
          <Link
            href="/kategoriler"
            className="mt-4 inline-block text-sm font-semibold text-purple-700 hover:underline"
          >
            Hizmetlere Göz At
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {conversations.map((c) => {
            const viewerIsBuyer = c.buyerId === viewer.id;
            const other = viewerIsBuyer ? c.seller : c.buyer;
            const readAt = viewerIsBuyer ? c.buyerLastReadAt : c.sellerLastReadAt;
            const unread = readAt === null || readAt < c.lastMessageAt;
            const last = c.messages[0];

            return (
              <li key={c.id}>
                <Link
                  href={`/panel/mesajlar/${c.id}`}
                  className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 ${
                    unread ? "bg-purple-50/40" : ""
                  }`}
                >
                  <UserAvatar name={other.name} image={other.image} className="h-10 w-10 shrink-0 text-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className={`truncate text-sm ${unread ? "font-bold" : "font-semibold"} text-brand-navy`}>
                        {other.name}
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          {viewerIsBuyer ? "Freelancer" : "Alıcı"}
                        </span>
                      </p>
                      <span className="shrink-0 text-[11px] text-slate-400">{dateFmt.format(c.lastMessageAt)}</span>
                    </div>
                    {last && (
                      <p className={`truncate text-sm ${unread ? "text-brand-navy" : "text-slate-500"}`}>
                        {last.senderId === viewer.id ? "Sen: " : ""}
                        {last.body}
                      </p>
                    )}
                  </div>
                  {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-purple-600" aria-label="Okunmamış" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
