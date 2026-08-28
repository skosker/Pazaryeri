-- Şirket tahsilat hesabını tekten çoğa çıkarır.
--
-- Önce tek satır vardı (id "default"). Artık admin panelinden birden çok hesap eklenip
-- çıkarılabiliyor; ödeme sayfası hepsini listeliyor. Var olan "default" satırı silinmiyor,
-- hesaplardan biri olarak kalıyor — geçişte alıcıya görünen Garanti hesabı aynen duruyor.
--
-- id artık uygulama tarafında cuid ile üretiliyor, o yüzden kolonun 'default' varsayılanı
-- düşürülüyor. createdAt sıralı listeleme için ekleniyor; var olan satır now() alıyor.

ALTER TABLE "bank_accounts" ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "bank_accounts" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
