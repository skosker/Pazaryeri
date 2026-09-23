-- AlterTable
ALTER TABLE "gigs" ADD COLUMN     "sponsoredUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "gig_boosts" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'paytr',
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIALIZED',
    "amount" DECIMAL(10,2) NOT NULL,
    "days" INTEGER NOT NULL,
    "token" TEXT,
    "rawResponse" JSONB,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gigId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "gig_boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "proPriceTl" DECIMAL(10,2) NOT NULL DEFAULT 1000,
    "portfolioImages" INTEGER NOT NULL DEFAULT 5,
    "portfolioImagesPro" INTEGER NOT NULL DEFAULT 12,
    "boostEnabled" BOOLEAN NOT NULL DEFAULT true,
    "boostPriceTl" DECIMAL(10,2) NOT NULL DEFAULT 1000,
    "boostDays" INTEGER NOT NULL DEFAULT 30,
    "commissionPercent" DECIMAL(5,2) NOT NULL DEFAULT 2.5,
    "founderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "founderLimit" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gig_boosts_gigId_idx" ON "gig_boosts"("gigId");

-- CreateIndex
CREATE INDEX "gig_boosts_userId_idx" ON "gig_boosts"("userId");

-- AddForeignKey
ALTER TABLE "gig_boosts" ADD CONSTRAINT "gig_boosts_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "gigs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gig_boosts" ADD CONSTRAINT "gig_boosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

