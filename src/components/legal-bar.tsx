/**
 * The company and policy pages every page links to from the footer. Kept apart from the
 * footer itself so the legal pages' side menu (LegalNav) can list the same set.
 */

export const companyLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/nasil-calisir", label: "Nasıl Çalışır?" },
  { href: "/destek", label: "Destek" },
];

export const policyLinks = [
  { href: "/uyelik-sozlesmesi", label: "Üyelik Sözleşmesi" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/iptal-iade-kosullari", label: "Sipariş İptal ve İade Koşulları" },
  { href: "/gizlilik-politikasi", label: "Kişisel Verilerin Korunması Politikası" },
];

/** The pages the legal-page side menu lists (no "Nasıl Çalışır?", which is not one of them). */
export const legalLinks = [...companyLinks.filter((l) => l.href !== "/nasil-calisir"), ...policyLinks];
