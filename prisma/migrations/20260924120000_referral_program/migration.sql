
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredById" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "creditDiscount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "referralEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "referralRewardTl" DECIMAL(10,2) NOT NULL DEFAULT 200;

-- CreateTable
CREATE TABLE "referral_rewards" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrerId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "sourceOrderId" TEXT NOT NULL,
    "usedOrderId" TEXT,

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_rewards_referredUserId_key" ON "referral_rewards"("referredUserId");

-- CreateIndex
CREATE UNIQUE INDEX "referral_rewards_usedOrderId_key" ON "referral_rewards"("usedOrderId");

-- CreateIndex
CREATE INDEX "referral_rewards_referrerId_idx" ON "referral_rewards"("referrerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_usedOrderId_fkey" FOREIGN KEY ("usedOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

