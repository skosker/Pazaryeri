-- AlterTable
ALTER TABLE "pro_purchases" ADD COLUMN     "paidAt" TIMESTAMP(3);


-- Paid purchases from before this column: updatedAt is the payment time unless an invoice
-- number was entered afterwards (that moved it), in which case createdAt is the closest
-- record left.
UPDATE "pro_purchases"
SET "paidAt" = CASE WHEN "invoicedAt" IS NULL THEN "updatedAt" ELSE "createdAt" END
WHERE "status" = 'SUCCESS';
