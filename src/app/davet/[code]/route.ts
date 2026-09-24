import { NextResponse, type NextRequest } from "next/server";
import { REFERRAL_CODE_PATTERN, REFERRAL_COOKIE } from "@/lib/referrals";

/**
 * A personal invite link: remembers the code for 30 days and sends the visitor to
 * signup. The code is only checked against the database when they actually register.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const normalized = code.toUpperCase();
  const response = NextResponse.redirect(new URL("/kayit", request.url));
  if (REFERRAL_CODE_PATTERN.test(normalized)) {
    response.cookies.set(REFERRAL_COOKIE, normalized, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}
