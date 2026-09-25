-- AlterTable
ALTER TABLE "users" ADD COLUMN     "campaignEmails" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "announcedAt" TIMESTAMP(3),
ADD COLUMN     "announcedCount" INTEGER;

