import { randomInt } from "crypto";

/**
 * Accounts an admin opens in bulk for a testing firm (Admin → Kullanıcılar → Toplu Test
 * Hesabı). Their addresses are on a Prosinta domain with no mailbox — email.ts sends
 * nothing there — so they are created already verified and their password is shown to
 * the admin once, to hand out.
 */
export const TEST_EMAIL_DOMAIN = "test.prosinta.com";
export const MAX_TEST_ACCOUNTS = 50;

export const isBulkTestEmail = (email: string) => email.endsWith(`@${TEST_EMAIL_DOMAIN}`);

const TR_ASCII: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

/** "KADRİ  TUĞLU" → "Kadri Tuğlu" (Turkish İ/ı rules). */
export function titleCaseTr(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr") + word.slice(1).toLocaleLowerCase("tr"))
    .join(" ");
}

/** "Fırat Çiçeklitaş" → "firat.ciceklitas"; empty when nothing usable is left. */
export function emailLocalPart(name: string): string {
  return name
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (c) => TR_ASCII[c])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .join(".");
}

/**
 * One person per line, as pasted from a list or a two-column table (tabs count as
 * spaces). Blank lines and repeats are dropped.
 */
export function parseNames(text: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const name = titleCaseTr(line);
    if (name.length < 3) continue;
    const key = name.toLocaleLowerCase("tr");
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

// No 0/O, 1/l/I: the password is read off a screen or a printout.
const PASSWORD_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** "Kp7mx-3QaTe": meets the site's password rule (lower, upper, digit). */
export function generatePassword(): string {
  for (;;) {
    let s = "";
    for (let i = 0; i < 10; i++) s += PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)];
    if (/[a-z]/.test(s) && /[A-Z]/.test(s) && /[0-9]/.test(s)) return `${s.slice(0, 5)}-${s.slice(5)}`;
  }
}
