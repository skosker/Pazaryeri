-- CreateEnum
CREATE TYPE "MembershipPlan" AS ENUM ('PRO', 'PRO_PLUS');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "proPlus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proReminderFor" TIMESTAMP(3),
ADD COLUMN     "proTrialUsedAt" TIMESTAMP(3),
ADD COLUMN     "proUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "pro_purchases" ADD COLUMN     "months" INTEGER,
ADD COLUMN     "plan" "MembershipPlan" NOT NULL DEFAULT 'PRO';

-- AlterTable
ALTER TABLE "gig_boosts" ADD COLUMN     "creditMonth" TEXT;

-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "proPriceTl",
ADD COLUMN     "plusBoostDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 25,
ADD COLUMN     "plusFreeBoostDays" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "plusMonthlyTl" DECIMAL(10,2) NOT NULL DEFAULT 1250,
ADD COLUMN     "portfolioImagesPlus" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "proFreeBoostDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "proMonthlyTl" DECIMAL(10,2) NOT NULL DEFAULT 1000,
ADD COLUMN     "proTrialDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "proTrialEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "yearlyDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 20;

-- CreateIndex
CREATE UNIQUE INDEX "gig_boosts_userId_creditMonth_key" ON "gig_boosts"("userId", "creditMonth");

