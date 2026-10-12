/** What an admin can set a freelancer's membership to (setMembershipAction). */
export const ADMIN_MEMBERSHIP_OPTIONS = {
  ucretsiz: { label: "Ücretsiz", plus: false, months: 0, forever: false },
  "pro-1": { label: "Pro · 1 ay", plus: false, months: 1, forever: false },
  "pro-12": { label: "Pro · 1 yıl", plus: false, months: 12, forever: false },
  "pro-suresiz": { label: "Pro · süresiz", plus: false, months: 0, forever: true },
  "plus-1": { label: "Pro Plus · 1 ay", plus: true, months: 1, forever: false },
  "plus-12": { label: "Pro Plus · 1 yıl", plus: true, months: 12, forever: false },
} as const;

export type AdminMembershipOption = keyof typeof ADMIN_MEMBERSHIP_OPTIONS;
