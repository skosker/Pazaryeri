import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site-url";
import { sendMembershipEndingEmail } from "@/lib/email";
import { untilFormat } from "@/lib/membership";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Daily (vercel.json): e-mail freelancers whose paid or trial membership ends within a
 * week, once per period. Vercel sends `Authorization: Bearer $CRON_SECRET`; without the
 * secret configured nobody can run it.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const candidates = await prisma.user.findMany({
    where: {
      role: "FREELANCER",
      synthetic: false,
      suspended: false,
      proUntil: { gt: now, lte: new Date(now.getTime() + WEEK_MS) },
    },
    select: { id: true, email: true, name: true, proUntil: true, proPlus: true, proReminderFor: true, proTrialUsedAt: true },
  });

  let sent = 0;
  for (const user of candidates) {
    // proReminderFor remembers which end date was reminded; a renewal moves proUntil on.
    if (user.proReminderFor?.getTime() === user.proUntil!.getTime()) continue;
    // Claim it first so an overlapping run cannot send the same reminder twice.
    const { count } = await prisma.user.updateMany({
      where: { id: user.id, proUntil: user.proUntil, OR: [{ proReminderFor: null }, { proReminderFor: { not: user.proUntil } }] },
      data: { proReminderFor: user.proUntil },
    });
    if (count === 0) continue;
    await sendMembershipEndingEmail({
      to: user.email,
      name: user.name,
      planLabel: user.proPlus ? "Pro Plus" : "Pro",
      until: untilFormat.format(user.proUntil!),
      // A trial is the only period that started with no purchase on record.
      trial: user.proTrialUsedAt !== null && !(await prisma.proPurchase.count({ where: { userId: user.id, status: "SUCCESS", months: { not: null } } })),
      renewUrl: `${siteUrl}/panel/pro-ol`,
    });
    sent++;
  }

  return NextResponse.json({ checked: candidates.length, sent });
}
