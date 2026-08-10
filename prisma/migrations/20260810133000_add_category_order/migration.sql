-- AlterTable
ALTER TABLE "categories" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- Set explicit display order (mirrors Upwork's category menu ordering,
-- localized; extra categories we have beyond Upwork's list are appended).
UPDATE "categories" SET "order" = 1 WHERE "slug" = 'ai-otomasyon';
UPDATE "categories" SET "order" = 2 WHERE "slug" = 'yazilim-web';
UPDATE "categories" SET "order" = 3 WHERE "slug" = 'grafik-tasarim';
UPDATE "categories" SET "order" = 4 WHERE "slug" = 'dijital-pazarlama';
UPDATE "categories" SET "order" = 5 WHERE "slug" = 'veri-analitik';
UPDATE "categories" SET "order" = 6 WHERE "slug" = 'is-danismanlik';
UPDATE "categories" SET "order" = 7 WHERE "slug" = 'yazi-ceviri';
UPDATE "categories" SET "order" = 8 WHERE "slug" = 'video-animasyon';
UPDATE "categories" SET "order" = 9 WHERE "slug" = 'egitim-ders';
UPDATE "categories" SET "order" = 10 WHERE "slug" = 'muzik-ses';
