import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email-preferences";

/**
 * One-click unsubscribe (RFC 8058): mail clients POST here from the List-Unsubscribe
 * header. GET is not accepted, so a link scanner cannot unsubscribe anybody.
 */
export async function POST(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("u") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!userId || !verifyUnsubscribeToken(userId, token)) {
    return new NextResponse("Geçersiz bağlantı", { status: 400 });
  }
  await prisma.user.updateMany({ where: { id: userId }, data: { campaignEmails: false } });
  return new NextResponse("OK");
}
