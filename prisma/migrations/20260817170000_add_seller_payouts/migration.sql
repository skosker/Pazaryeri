-- Seller payout details and a payable row per completed order.

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "iban" TEXT;
ALTER TABLE "users" ADD COLUMN "ibanHolder" TEXT;

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "gross" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "net" DECIMAL(10,2) NOT NULL,
    "iban" TEXT,
    "ibanHolder" TEXT,
    "note" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payouts_orderId_key" ON "payouts"("orderId");
CREATE INDEX "payouts_sellerId_idx" ON "payouts"("sellerId");
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Orders already completed before this feature existed still owe the seller money.
INSERT INTO "payouts" ("id", "status", "gross", "commission", "net", "orderId", "sellerId", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'PENDING', o."amount", 0, o."amount", o.id, g."sellerId", now(), now()
FROM "orders" o
JOIN "gigs" g ON g.id = o."gigId"
WHERE o."status" = 'COMPLETED' AND o."escrowReleased" = true;
