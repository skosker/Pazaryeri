
-- CreateEnum
CREATE TYPE "JobRequestStatus" AS ENUM ('OPEN', 'HIRED', 'CLOSED', 'REMOVED');

-- CreateEnum
CREATE TYPE "JobOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- AlterEnum
ALTER TYPE "PackageTier" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "jobRequestEmails" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "jobRequestDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "jobRequestsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offerQuotaFree" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "offerQuotaPlus" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "offerQuotaPro" INTEGER NOT NULL DEFAULT 40;

-- CreateTable
CREATE TABLE "job_requests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetMin" INTEGER NOT NULL,
    "budgetMax" INTEGER NOT NULL,
    "deliveryDays" INTEGER NOT NULL,
    "status" "JobRequestStatus" NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,

    CONSTRAINT "job_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "deliveryDays" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" "JobOfferStatus" NOT NULL DEFAULT 'PENDING',
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_requests_status_createdAt_idx" ON "job_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "job_requests_categoryId_idx" ON "job_requests"("categoryId");

-- CreateIndex
CREATE INDEX "job_requests_buyerId_idx" ON "job_requests"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "job_offers_orderId_key" ON "job_offers"("orderId");

-- CreateIndex
CREATE INDEX "job_offers_sellerId_createdAt_idx" ON "job_offers"("sellerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "job_offers_requestId_sellerId_key" ON "job_offers"("requestId", "sellerId");

-- AddForeignKey
ALTER TABLE "job_requests" ADD CONSTRAINT "job_requests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requests" ADD CONSTRAINT "job_requests_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "job_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "gigs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

