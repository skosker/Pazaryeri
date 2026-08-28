-- Banka hesaplarına pasife alma özelliği ekler.
--
-- Admin artık bir hesabı silmeden ödeme sayfasından kaldırabiliyor (ör. hesap geçici
-- olarak kullanılmıyor ama bilgileri saklı kalsın istendiğinde). Var olan tüm hesaplar
-- aktif olarak kalır.

ALTER TABLE "bank_accounts" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
