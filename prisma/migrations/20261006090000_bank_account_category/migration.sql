-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN     "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "bank_accounts_categoryId_idx" ON "bank_accounts"("categoryId");

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

