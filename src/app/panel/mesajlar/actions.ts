"use server";

import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { sendNewMessageEmail } from "@/lib/email";
import {
  MESSAGE_MAX_LENGTH,
  maskContactInfo,
  resolvePair,
  sentTooManyRecently,
  startedTooManyToday,
  toThreadMessage,
  type ThreadMessage,
} from "@/lib/messaging";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const cannotReach = "Bu kullanıcıya şu an mesaj gönderilemiyor.";
const tooFast = "Çok hızlı mesaj gönderiyorsun, biraz bekleyip tekrar dene.";

function readBody(raw: unknown): { text: string } | { error: string } {
  const text = String(raw ?? "").trim();
  if (!text) return { error: "Mesaj boş olamaz." };
  if (text.length > MESSAGE_MAX_LENGTH) {
    return { error: `Mesaj en fazla ${MESSAGE_MAX_LENGTH} karakter olabilir.` };
  }
  return { text };
}

/**
 * Saves a message with contact details masked, moves the thread's clock (the sender has
 * by definition read everything up to their own message), and emails the other side —
 * but only if they have opened the thread since the last email, so a burst of messages
 * sends one email, not one per message.
 */
async function deliver(conversationId: string, senderId: string, text: string) {
  const conversation = await prisma.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    include: {
      buyer: { select: { name: true, email: true } },
      seller: { select: { name: true, email: true } },
    },
  });
  const senderIsBuyer = conversation.buyerId === senderId;
  const { body, reasons } = maskContactInfo(text);
  const now = new Date();

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        body,
        maskedReason: reasons.length > 0 ? reasons.join(", ") : null,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: now,
        ...(senderIsBuyer ? { buyerLastReadAt: now } : { sellerLastReadAt: now }),
      },
    }),
  ]);

  const sender = senderIsBuyer ? conversation.buyer : conversation.seller;
  const recipient = senderIsBuyer ? conversation.seller : conversation.buyer;
  const recipientReadAt = senderIsBuyer ? conversation.sellerLastReadAt : conversation.buyerLastReadAt;
  const recipientNotifiedAt = senderIsBuyer ? conversation.sellerNotifiedAt : conversation.buyerNotifiedAt;
  const emailDue =
    recipientNotifiedAt === null || (recipientReadAt !== null && recipientReadAt > recipientNotifiedAt);

  if (emailDue) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: senderIsBuyer ? { sellerNotifiedAt: now } : { buyerNotifiedAt: now },
    });
    await sendNewMessageEmail({
      to: recipient.email,
      recipientName: recipient.name,
      senderName: sender.name,
      preview: body,
      threadUrl: `${appUrl}/panel/mesajlar/${conversationId}`,
    });
  }

  return { message, masked: reasons.length > 0 };
}

export type ComposeState = { error?: string };

/**
 * First message to someone. Reuses the pair's existing thread if there is one (a second
 * tab, or a thread started from an order), so the pair never ends up with two.
 */
export async function startConversationAction(
  otherId: string,
  orderId: string | null,
  _prev: ComposeState,
  formData: FormData
): Promise<ComposeState> {
  const viewer = await activeUser();
  if (!viewer) redirect("/giris?callbackUrl=/panel/mesajlar");

  const pair = await resolvePair(viewer.id, otherId, orderId ?? undefined);
  if ("error" in pair) return { error: pair.error };

  const read = readBody(formData.get("body"));
  if ("error" in read) return { error: read.error };

  const existing = await prisma.conversation.findUnique({
    where: { buyerId_sellerId: pair },
    select: { id: true },
  });
  if (!existing && (await startedTooManyToday(viewer.id))) {
    return { error: "Bugün çok fazla yeni konuşma başlattın, yarın tekrar dene." };
  }
  if (await sentTooManyRecently(viewer.id)) return { error: tooFast };

  const conversation =
    existing ??
    (await prisma.conversation.upsert({
      where: { buyerId_sellerId: pair },
      create: pair,
      update: {},
      select: { id: true },
    }));

  const { masked } = await deliver(conversation.id, viewer.id, read.text);
  redirect(`/panel/mesajlar/${conversation.id}${masked ? "?gizlendi=1" : ""}`);
}

async function participantConversation(conversationId: string, viewerId: string) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, OR: [{ buyerId: viewerId }, { sellerId: viewerId }] },
    select: {
      id: true,
      buyerId: true,
      buyer: { select: { synthetic: true, suspended: true } },
      seller: { select: { synthetic: true, suspended: true } },
    },
  });
}

export async function sendMessageAction(
  conversationId: string,
  rawText: string
): Promise<{ message?: ThreadMessage; masked?: boolean; error?: string }> {
  const viewer = await activeUser();
  if (!viewer) return { error: "Oturumun kapanmış, tekrar giriş yap." };

  const conversation = await participantConversation(conversationId, viewer.id);
  if (!conversation) return { error: "Konuşma bulunamadı." };

  const other = conversation.buyerId === viewer.id ? conversation.seller : conversation.buyer;
  if (other.synthetic || other.suspended) return { error: cannotReach };

  const read = readBody(rawText);
  if ("error" in read) return { error: read.error };
  if (await sentTooManyRecently(viewer.id)) return { error: tooFast };

  const { message, masked } = await deliver(conversationId, viewer.id, read.text);
  return { message: toThreadMessage(message), masked };
}

/**
 * What arrived since `afterIso`, for the open thread's periodic check. Deliberately small:
 * it runs every few seconds per open thread, and only the new rows cross the wire.
 * `gte` rather than `gt` so a message stamped in the same millisecond is not skipped — the
 * client drops ids it already has.
 */
export async function pollMessagesAction(conversationId: string, afterIso: string): Promise<ThreadMessage[]> {
  const viewer = await activeUser();
  if (!viewer) return [];

  const conversation = await participantConversation(conversationId, viewer.id);
  if (!conversation) return [];

  const after = new Date(afterIso);
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(Number.isNaN(after.getTime()) ? {} : { createdAt: { gte: after } }),
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  // Only genuinely new messages from the other side mark the thread read — the `gte`
  // above always returns the last one the client already has, and re-marking on every
  // poll would be a write every few seconds for nothing.
  if (messages.some((m) => m.senderId !== viewer.id && m.createdAt > after)) {
    const now = new Date();
    await prisma.conversation.update({
      where: { id: conversationId },
      data: conversation.buyerId === viewer.id ? { buyerLastReadAt: now } : { sellerLastReadAt: now },
    });
  }

  return messages.map(toThreadMessage);
}
