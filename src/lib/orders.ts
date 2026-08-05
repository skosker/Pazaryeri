import { prisma } from "@/lib/prisma";

export class OrderError extends Error {}

export async function createOrder(buyerId: string, packageId: string) {
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    include: { gig: true },
  });

  if (!pkg) throw new OrderError("Paket bulunamadı");
  if (pkg.gig.sellerId === buyerId) {
    throw new OrderError("Kendi hizmetinizi satın alamazsınız");
  }

  return prisma.order.create({
    data: {
      buyerId,
      gigId: pkg.gigId,
      packageId: pkg.id,
      amount: pkg.price,
    },
  });
}
