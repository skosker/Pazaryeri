-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "revisionsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cancellationRequestedAt" TIMESTAMP(3);
