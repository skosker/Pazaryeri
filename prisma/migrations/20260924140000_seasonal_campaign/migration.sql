
-- AlterTable
ALTER TABLE "gigs" ADD COLUMN     "campaignPercent" INTEGER;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "campaignEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "campaignEnd" TIMESTAMP(3),
ADD COLUMN     "campaignMaxPercent" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "campaignMinPercent" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "campaignName" TEXT NOT NULL DEFAULT 'Efsane Cuma',
ADD COLUMN     "campaignStart" TIMESTAMP(3);

