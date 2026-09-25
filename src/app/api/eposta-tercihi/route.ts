import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { EMAIL_KIND_FIELD, parseEmailKind, verifyUnsubscribeToken } from "@/lib/email-preferences";

/**
 * One-click unsubscribe (RFC 8058): mail clients POST here from the List-Unsubscribe
 * header. GET is not accepted, so a link scanner cannot unsubscribe anybody.
 */
export async function POST(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("u") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const kind = parseEmailKind(request.nextUrl.searchParams.get("tur"));
  if (!userId || !verifyUnsubscribeToken(userId, token, kind)) {
    return new NextResponse("Geçersiz bağlantı", { status: 400 });
  }
  await prisma.user.updateMany({ where: { id: userId }, data: { [EMAIL_KIND_FIELD[kind]]: false } });
  return new NextResponse("OK");
}
