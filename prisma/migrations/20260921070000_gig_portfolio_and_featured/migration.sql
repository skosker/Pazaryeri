-- İlk sipariş öncesi yorum olmadığı için güven veren iki alan: freelancer'ın kendi
-- yüklediği "örnek işler" görselleri, ve admin'in elle işaretleyebildiği "Editör
-- Seçkisi" rozeti. İkisi de var olan satırlarda boş/kapalı başlar, mevcut davranışı
-- değiştirmez.

-- AlterTable
ALTER TABLE "gigs" ADD COLUMN "portfolioImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
