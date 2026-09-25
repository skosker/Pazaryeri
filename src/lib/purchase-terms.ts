import { prisma } from "@/lib/prisma";

export class PurchaseTermsError extends Error {
  constructor() {
    super("Ödemeden önce Ön Bilgilendirme Formu ve Mesafeli Hizmet Sözleşmesi'ni onaylamalısın.");
  }
}

/** Record the buyer's consent on their open purchase (only their own, only while unpaid). */
export async function acceptPurchaseTerms(kind: "uyelik" | "one-cikar", id: string, userId: string) {
  const where = { id, userId, status: "INITIALIZED" as const };
  const data = { termsAcceptedAt: new Date() };
  if (kind === "uyelik") await prisma.proPurchase.updateMany({ where, data });
  else await prisma.gigBoost.updateMany({ where, data });
}

/** Payment actions call this: no recorded consent, no payment. */
export function assertTermsAccepted(purchase: { termsAcceptedAt: Date | null }) {
  if (!purchase.termsAcceptedAt) throw new PurchaseTermsError();
}

/** The buyer as the pre-purchase documents name them; a company account buys as a company. */
export async function purchaseBuyer(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      companyName: true,
      taxOffice: true,
      taxNumber: true,
      billingAddress: true,
      billingDistrict: true,
      billingCity: true,
    },
  });
  const address = [user.billingAddress, user.billingCity ? `${user.billingDistrict} / ${user.billingCity}` : null]
    .filter(Boolean)
    .join(", ");
  return {
    consumer: !user.companyName,
    buyer: {
      name: user.name,
      email: user.email,
      company: user.companyName
        ? { name: user.companyName, taxOffice: user.taxOffice, taxNumber: user.taxNumber, address: address || null }
        : null,
    },
  };
}
