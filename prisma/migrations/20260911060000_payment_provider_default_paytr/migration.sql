-- Payment.provider'ın varsayılan değerini "iyzico"dan "paytr"ye çevirir — kart ile
-- ödeme artık PayTR iFrame API üzerinden yapılıyor. Var olan satırları değiştirmez,
-- yalnızca yeni satırlar için varsayılanı günceller.

ALTER TABLE "payments" ALTER COLUMN "provider" SET DEFAULT 'paytr';
