-- CreateTable
CREATE TABLE "expense_vouchers" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "payeeName" TEXT NOT NULL,
    "payeeTckn" TEXT NOT NULL,
    "payeeAddress" TEXT NOT NULL,
    "payeeIban" TEXT,
    "items" JSONB NOT NULL,
    "gross" DECIMAL(12,2) NOT NULL,
    "withholdingPercent" DECIMAL(5,2) NOT NULL,
    "withholding" DECIMAL(12,2) NOT NULL,
    "net" DECIMAL(12,2) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expense_vouchers_number_key" ON "expense_vouchers"("number");

-- CreateIndex
CREATE INDEX "expense_vouchers_issuedAt_idx" ON "expense_vouchers"("issuedAt");

