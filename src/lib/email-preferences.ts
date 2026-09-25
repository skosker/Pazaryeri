import { createHmac, timingSafeEqual } from "crypto";
import { siteUrl } from "@/lib/site-url";

/**
 * Signed unsubscribe links for announcement e-mails: the token proves the link came from
 * us, so nobody can switch off someone else's e-mails by guessing their id. Each kind of
 * e-mail has its own token, so a link only ever switches off the kind it came with.
 */
export type EmailKind = "kampanya" | "is-talebi";

/** The User column each kind of e-mail is switched on and off with. */
export const EMAIL_KIND_FIELD = { kampanya: "campaignEmails", "is-talebi": "jobRequestEmails" } as const;

export const EMAIL_KIND_LABEL: Record<EmailKind, string> = {
  kampanya: "Kampanya Duyuruları",
  "is-talebi": "İş Talebi Özetleri",
};

export function parseEmailKind(value: unknown): EmailKind {
  return value === "is-talebi" ? "is-talebi" : "kampanya";
}

function token(userId: string, kind: EmailKind): string {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret).update(`${kind}-eposta:${userId}`).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(userId: string, given: string, kind: EmailKind = "kampanya"): boolean {
  const expected = Buffer.from(token(userId, kind));
  const actual = Buffer.from(given);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function query(userId: string, kind: EmailKind): string {
  return `u=${encodeURIComponent(userId)}&t=${token(userId, kind)}${kind === "kampanya" ? "" : `&tur=${kind}`}`;
}

/** The page a person lands on from the e-mail's "almak istemiyorum" link. */
export function unsubscribePageUrl(userId: string, kind: EmailKind = "kampanya"): string {
  return `${siteUrl}/eposta-tercihi?${query(userId, kind)}`;
}

/** For the List-Unsubscribe header: mail clients POST here for one-click unsubscribe. */
export function unsubscribeOneClickUrl(userId: string, kind: EmailKind = "kampanya"): string {
  return `${siteUrl}/api/eposta-tercihi?${query(userId, kind)}`;
}
