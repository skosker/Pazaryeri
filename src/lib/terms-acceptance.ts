/**
 * The membership agreement a user accepts at signup, and what is on record about that
 * acceptance — for Admin → Freelancer Sözleşmeleri.
 */

/** "Son güncelleme" of the Üyelik Sözleşmesi: shown on its page and stored with each acceptance. */
export const UYELIK_SOZLESMESI_VERSION = "25 Eylül 2026";

/** The signup form's agreement box, word for word. */
export const TERMS_CHECKBOX_TEXT = "Üyelik Sözleşmesi'ni ve Kullanım Şartları'nı okudum, kabul ediyorum.";

/**
 * Since this moment (#88 live, 18 Eylül 2026 öğlen) the signup form is refused without that
 * box ticked, so an account opened through the form after it accepted the agreement. The
 * moment itself was only stored once termsAcceptedAt arrived, and an account made some other
 * way (a seed, a script) leaves no trace of how it was made — so for those accounts the
 * acceptance is stated as conditional, never as a fact.
 */
export const TERMS_REQUIRED_SINCE = new Date("2026-09-18T09:00:00Z");

/** Demo and seeded accounts live on this domain; nobody outside can receive mail there. */
export const DEMO_EMAIL_DOMAIN = "@demo.prosinta.com";

export type TermsAcceptance =
  /** Stored at signup: the moment and the version accepted. */
  | { kind: "recorded"; at: Date; version: string | null }
  /** Opened while the box was required, before acceptances were stored: accepted if it came through the form. */
  | { kind: "form"; at: Date }
  /** Opened before the box was required: nothing on record. */
  | { kind: "none"; at: Date }
  /** A generated showcase profile: nobody signed up, so nobody accepted. */
  | { kind: "synthetic" }
  /** A demo or seeded account (DEMO_EMAIL_DOMAIN): made by us, not through the signup form. */
  | { kind: "demo" };

export function termsAcceptance(user: {
  email: string;
  synthetic: boolean;
  createdAt: Date;
  termsAcceptedAt: Date | null;
  termsVersion: string | null;
}): TermsAcceptance {
  if (user.synthetic) return { kind: "synthetic" };
  if (user.termsAcceptedAt) return { kind: "recorded", at: user.termsAcceptedAt, version: user.termsVersion };
  if (user.email.endsWith(DEMO_EMAIL_DOMAIN)) return { kind: "demo" };
  if (user.createdAt >= TERMS_REQUIRED_SINCE) return { kind: "form", at: user.createdAt };
  return { kind: "none", at: user.createdAt };
}

export const TERMS_ACCEPTANCE_LABEL: Record<TermsAcceptance["kind"], string> = {
  recorded: "Onaylandı",
  form: "Onay anı kayıtlı değil",
  none: "Onay kaydı yok",
  synthetic: "Vitrin profili",
  demo: "Demo hesap",
};
