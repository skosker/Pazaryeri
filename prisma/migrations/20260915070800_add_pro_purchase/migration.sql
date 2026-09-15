-- CreateTable
CREATE TABLE "pro_purchases" (
    "id" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIALIZED',
    "amount" DECIMAL(10,2) NOT NULL,
    "token" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "pro_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pro_purchases_userId_idx" ON "pro_purchases"("userId");

-- AddForeignKey
ALTER TABLE "pro_purchases" ADD CONSTRAINT "pro_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
