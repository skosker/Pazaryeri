import { createHmac, timingSafeEqual } from "crypto";
import { siteUrl } from "@/lib/site-url";

/**
 * Signed unsubscribe links for announcement e-mails: the token proves the link came from
 * us, so nobody can switch off someone else's e-mails by guessing their id.
 */
function token(userId: string): string {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret).update(`kampanya-eposta:${userId}`).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(userId: string, given: string): boolean {
  const expected = Buffer.from(token(userId));
  const actual = Buffer.from(given);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** The page a person lands on from the e-mail's "almak istemiyorum" link. */
export function unsubscribePageUrl(userId: string): string {
  return `${siteUrl}/eposta-tercihi?u=${encodeURIComponent(userId)}&t=${token(userId)}`;
}

/** For the List-Unsubscribe header: mail clients POST here for one-click unsubscribe. */
export function unsubscribeOneClickUrl(userId: string): string {
  return `${siteUrl}/api/eposta-tercihi?u=${encodeURIComponent(userId)}&t=${token(userId)}`;
}
