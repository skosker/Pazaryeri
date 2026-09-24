-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MembershipPlan" ADD VALUE 'KURUMSAL';
ALTER TYPE "MembershipPlan" ADD VALUE 'KURUMSAL_PLUS';

-- AlterEnum
ALTER TYPE "BalanceEntryKind" ADD VALUE 'PLAN';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "corpPlan" "MembershipPlan",
ADD COLUMN     "corpPlanUntil" TIMESTAMP(3),
ADD COLUMN     "corpReminderFor" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "corporateDiscount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "corpMonthlyTl" DECIMAL(10,2) NOT NULL DEFAULT 1500,
ADD COLUMN     "corpOrderDiscountMaxTl" DECIMAL(10,2) NOT NULL DEFAULT 1000,
ADD COLUMN     "corpOrderDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 3,
ADD COLUMN     "corpPlusMonthlyTl" DECIMAL(10,2) NOT NULL DEFAULT 3500,
ADD COLUMN     "corpPlusOrderDiscountMaxTl" DECIMAL(10,2) NOT NULL DEFAULT 3000,
ADD COLUMN     "corpPlusOrderDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 5,
ADD COLUMN     "corpPlusTopUpBonusPercent" DECIMAL(5,2) NOT NULL DEFAULT 2,
ADD COLUMN     "corpTopUpBonusPercent" DECIMAL(5,2) NOT NULL DEFAULT 1,
ADD COLUMN     "corporatePlansEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "balance_entries" ADD COLUMN     "purchaseId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "balance_entries_purchaseId_key" ON "balance_entries"("purchaseId");

