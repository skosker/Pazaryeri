
-- CreateEnum
CREATE TYPE "BalanceEntryKind" AS ENUM ('TOPUP', 'ORDER', 'ADJUSTMENT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balance" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "corporateBonusPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "corporateEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "corporateMinTopUpTl" DECIMAL(10,2) NOT NULL DEFAULT 5000;

-- CreateTable
CREATE TABLE "balance_top_ups" (
    "id" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIALIZED',
    "amount" DECIMAL(12,2) NOT NULL,
    "bonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "balance_top_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_entries" (
    "id" TEXT NOT NULL,
    "kind" "BalanceEntryKind" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "orderId" TEXT,
    "topUpId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "balance_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "balance_top_ups_userId_idx" ON "balance_top_ups"("userId");

-- CreateIndex
CREATE INDEX "balance_top_ups_status_idx" ON "balance_top_ups"("status");

-- CreateIndex
CREATE UNIQUE INDEX "balance_entries_orderId_key" ON "balance_entries"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "balance_entries_topUpId_key" ON "balance_entries"("topUpId");

-- CreateIndex
CREATE INDEX "balance_entries_userId_createdAt_idx" ON "balance_entries"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "balance_top_ups" ADD CONSTRAINT "balance_top_ups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_entries" ADD CONSTRAINT "balance_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

