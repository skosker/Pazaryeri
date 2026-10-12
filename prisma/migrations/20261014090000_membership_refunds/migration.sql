-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'REFUNDED', 'REJECTED');

-- AlterEnum
ALTER TYPE "BalanceEntryKind" ADD VALUE 'REFUND';

-- CreateTable
CREATE TABLE "membership_refunds" (
    "id" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "iban" TEXT,
    "ibanHolder" TEXT,
    "requestedAt" TIMESTAMP(3),
    "amount" DECIMAL(10,2),
    "method" TEXT,
    "reference" TEXT,
    "invoiceAction" TEXT,
    "prevUntil" TIMESTAMP(3),
    "newUntil" TIMESTAMP(3),
    "rejectReason" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "purchaseId" TEXT NOT NULL,

    CONSTRAINT "membership_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "membership_refunds_purchaseId_key" ON "membership_refunds"("purchaseId");

-- CreateIndex
CREATE INDEX "membership_refunds_status_createdAt_idx" ON "membership_refunds"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "membership_refunds" ADD CONSTRAINT "membership_refunds_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "pro_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

