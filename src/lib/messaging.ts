import { prisma } from "@/lib/prisma";

export const MESSAGE_MAX_LENGTH = 2000;
export const CONTACT_MASK = "[iletişim bilgisi gizlendi]";

/** Messages a thread page loads; older history is not needed to carry on a conversation. */
export const THREAD_PAGE_SIZE = 100;

const MESSAGES_PER_MINUTE = 20;
const NEW_CONVERSATIONS_PER_DAY = 30;

/**
 * Contact details a buyer and seller could use to finish the deal off the platform, which
 * the membership agreement (7.1–7.2) forbids. Specific patterns run first so a message's
 * masked-reason names what was actually there rather than the generic digit rule.
 *
 * The phone rule needs ten or more digits joined only by spaces, dashes or brackets —
 * dots are left out on purpose, so dates ("01.10.2026 - 15.10.2026") and prices
 * ("1.500.000") are not mistaken for phone numbers.
 */
const contactRules: { reason: string; pattern: RegExp }[] = [
  { reason: "e-posta", pattern: /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/gi },
  { reason: "IBAN", pattern: /\bTR\s*\d{2}(?:[\s-]*\d){22}\b/gi },
  {
    reason: "mesajlaşma bağlantısı",
    pattern:
      /(?:https?:\/\/)?(?:www\.)?(?:wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com|t\.me|telegram\.me|instagram\.com|ig\.me|m\.me)\b[^\s]*/gi,
  },
  { reason: "telefon numarası", pattern: /\+?\d(?:[\s()-]{0,3}\d){9,}/g },
];

export function maskContactInfo(text: string): { body: string; reasons: string[] } {
  const reasons: string[] = [];
  let body = text;
  for (const { reason, pattern } of contactRules) {
    const next = body.replace(pattern, CONTACT_MASK);
    if (next !== body) {
      reasons.push(reason);
      body = next;
    }
  }
  return { body, reasons };
}

/** Conversations with at least one message the user has not seen yet. */
export async function unreadConversationCount(userId: string): Promise<number> {
  const fields = prisma.conversation.fields;
  return prisma.conversation.count({
    where: {
      OR: [
        {
          buyerId: userId,
          OR: [{ buyerLastReadAt: null }, { buyerLastReadAt: { lt: fields.lastMessageAt } }],
        },
        {
          sellerId: userId,
          OR: [{ sellerLastReadAt: null }, { sellerLastReadAt: { lt: fields.lastMessageAt } }],
        },
      ],
    },
  });
}

export type ConversationPair = { buyerId: string; sellerId: string };

/**
 * Who is the buyer and who the seller when `viewerId` wants to talk to `otherId`.
 *
 * From a gig or a profile the viewer is the buyer and `otherId` must be a real freelancer
 * — showcase profiles cannot log in, so a message to one would never be answered. From an
 * order the pair is whatever the order says, which is the one case a freelancer may start
 * the thread: they need to be able to reach a customer who is waiting on them.
 */
export async function resolvePair(
  viewerId: string,
  otherId: string,
  orderId?: string
): Promise<ConversationPair | { error: string }> {
  if (viewerId === otherId) return { error: "Kendinle mesajlaşamazsın." };

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyer: { select: { id: true, synthetic: true, suspended: true } },
        gig: { select: { seller: { select: { id: true, synthetic: true, suspended: true } } } },
      },
    });
    if (!order) return { error: "Sipariş bulunamadı." };
    const buyer = order.buyer;
    const seller = order.gig.seller;
    const ids = [buyer.id, seller.id];
    if (!ids.includes(viewerId) || !ids.includes(otherId)) return { error: "Bu sipariş sana ait değil." };
    if (buyer.synthetic || seller.synthetic || buyer.suspended || seller.suspended) {
      return { error: "Bu kullanıcıya şu an mesaj gönderilemiyor." };
    }
    return { buyerId: buyer.id, sellerId: seller.id };
  }

  const other = await prisma.user.findUnique({
    where: { id: otherId },
    select: { role: true, synthetic: true, suspended: true },
  });
  if (!other || other.role !== "FREELANCER" || other.synthetic || other.suspended) {
    return { error: "Bu kullanıcıya şu an mesaj gönderilemiyor." };
  }
  return { buyerId: viewerId, sellerId: otherId };
}

export async function sentTooManyRecently(senderId: string): Promise<boolean> {
  const count = await prisma.message.count({
    where: { senderId, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  return count >= MESSAGES_PER_MINUTE;
}

export async function startedTooManyToday(buyerId: string): Promise<boolean> {
  const count = await prisma.conversation.count({
    where: { buyerId, createdAt: { gt: new Date(Date.now() - 24 * 60 * 60_000) } },
  });
  return count >= NEW_CONVERSATIONS_PER_DAY;
}

export type ThreadMessage = {
  id: string;
  senderId: string;
  body: string;
  masked: boolean;
  createdAt: string;
};

export function toThreadMessage(m: {
  id: string;
  senderId: string;
  body: string;
  maskedReason: string | null;
  createdAt: Date;
}): ThreadMessage {
  return {
    id: m.id,
    senderId: m.senderId,
    body: m.body,
    masked: m.maskedReason !== null,
    createdAt: m.createdAt.toISOString(),
  };
}

/** Where a "Mesaj Gönder" button leads: the composer when signed in, the login page first otherwise. */
export function messageLink(otherId: string, signedIn: boolean, query?: Record<string, string>): string {
  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  const target = `/panel/mesajlar/yeni/${otherId}${qs}`;
  return signedIn ? target : `/giris?callbackUrl=${encodeURIComponent(target)}`;
}
