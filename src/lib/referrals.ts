import { randomInt } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { sendReferralRewardEmail } from "@/lib/email";

/** Set by /davet/<kod> and read once at signup. */
export const REFERRAL_COOKIE = "prosinta_davet";
export const REFERRAL_CODE_PATTERN = /^[A-Z0-9]{6,12}$/;

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
// No 0/O/1/I, so a code read aloud or copied by hand survives.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type Money = number | { toString(): string };

/** The user's invite code, created the first time they open the invite page. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { referralCode: true } });
  if (user.referralCode) return user.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Array.from({ length: 8 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      return code;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
  }
  throw new Error("Davet kodu üretilemedi");
}

/** Who a code belongs to, if it is a real, active account that may invite. */
export async function referrerByCode(code: string | undefined | null) {
  if (!code || !REFERRAL_CODE_PATTERN.test(code)) return null;
  const user = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true, name: true, suspended: true, synthetic: true },
  });
  if (!user || user.suspended || user.synthetic) return null;
  return { id: user.id, name: user.name };
}

/**
 * Called when an order completes: if its buyer was invited, their inviter earns the
 * reward — once per invited user (the unique referredUserId makes a second completion,
 * or two at the same moment, a no-op).
 */
export async function grantReferralReward(order: { id: string; buyerId: string }): Promise<void> {
  const { referralEnabled, referralRewardTl } = await getSettings();
  if (!referralEnabled || referralRewardTl <= 0) return;

  const buyer = await prisma.user.findUnique({
    where: { id: order.buyerId },
    select: {
      name: true,
      synthetic: true,
      referredBy: { select: { id: true, name: true, email: true, suspended: true, synthetic: true } },
    },
  });
  const referrer = buyer?.referredBy;
  if (!buyer || buyer.synthetic || !referrer || referrer.suspended || referrer.synthetic) return;

  try {
    await prisma.referralReward.create({
      data: {
        referrerId: referrer.id,
        referredUserId: order.buyerId,
        sourceOrderId: order.id,
        amount: referralRewardTl,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return;
    throw error;
  }

  await sendReferralRewardEmail({
    to: referrer.email,
    name: referrer.name,
    friendName: buyer.name,
    amount: referralRewardTl,
    inviteUrl: `${appUrl}/panel/davet`,
  });
}

/** A reward is spent once the order it was applied to got past unpaid. */
const RELEASING_STATUSES = ["PENDING_PAYMENT", "CANCELLED"] as const;

/**
 * Apply (or re-check) the buyer's referral reward on an unpaid order right before it is
 * paid, the same way the first-order discount is re-checked. A reward held by another of
 * the buyer's still-unpaid or cancelled orders moves to this one; a reward only applies to
 * an order worth more than it, so nobody checks out a free order. Returns the credit.
 */
export async function refreshReferralCredit(order: {
  id: string;
  buyerId: string;
  amount: Money;
  discount: Money;
  creditDiscount: Money;
}): Promise<number> {
  const payable = Number(order.amount) - Number(order.discount);
  const rewards = await prisma.referralReward.findMany({
    where: { referrerId: order.buyerId },
    select: { id: true, amount: true, usedOrderId: true, usedOrder: { select: { status: true } } },
    orderBy: { createdAt: "asc" },
  });

  const mine = rewards.find((r) => r.usedOrderId === order.id);
  const free = rewards.find(
    (r) =>
      r.usedOrderId !== order.id &&
      (!r.usedOrder || (RELEASING_STATUSES as readonly string[]).includes(r.usedOrder.status))
  );
  const reward = mine ?? free;

  let credit = 0;
  if (reward && Number(reward.amount) < payable) {
    credit = Number(reward.amount);
    if (!mine) {
      if (reward.usedOrderId) {
        await prisma.order.update({ where: { id: reward.usedOrderId }, data: { creditDiscount: 0 } });
      }
      await prisma.referralReward.update({ where: { id: reward.id }, data: { usedOrderId: order.id } });
    }
  } else if (mine) {
    // The order no longer qualifies (e.g. the first-order discount now covers more of it).
    await prisma.referralReward.update({ where: { id: mine.id }, data: { usedOrderId: null } });
  }

  if (credit !== Number(order.creditDiscount)) {
    await prisma.order.update({ where: { id: order.id }, data: { creditDiscount: credit } });
  }
  return credit;
}

/** For the invite page: who signed up, what was earned, what is still to spend. */
export async function referralSummary(userId: string) {
  const [invited, rewards] = await Promise.all([
    prisma.user.count({ where: { referredById: userId } }),
    prisma.referralReward.findMany({
      where: { referrerId: userId },
      select: { amount: true, usedOrder: { select: { status: true } } },
    }),
  ]);
  const earned = rewards.reduce((sum, r) => sum + Number(r.amount), 0);
  const available = rewards
    .filter((r) => !r.usedOrder || (RELEASING_STATUSES as readonly string[]).includes(r.usedOrder.status))
    .reduce((sum, r) => sum + Number(r.amount), 0);
  return { invited, rewardCount: rewards.length, earned, available };
}
