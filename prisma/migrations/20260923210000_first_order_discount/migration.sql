-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "firstOrderEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "firstOrderMaxTl" DECIMAL(10,2) NOT NULL DEFAULT 500,
ADD COLUMN     "firstOrderPercent" DECIMAL(5,2) NOT NULL DEFAULT 5;

