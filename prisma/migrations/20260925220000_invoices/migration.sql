-- AlterTable
ALTER TABLE "pro_purchases" ADD COLUMN     "invoiceNo" TEXT,
ADD COLUMN     "invoicedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "gig_boosts" ADD COLUMN     "invoiceNo" TEXT,
ADD COLUMN     "invoicedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "payouts" ADD COLUMN     "invoiceNo" TEXT,
ADD COLUMN     "invoicedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "vatPercent" DECIMAL(5,2) NOT NULL DEFAULT 20;

