-- İçe aktarılan havale kayıtlarının tarihini 26.08.2026'ya sabitler.
--
-- Bir önceki migration tarihleri son ~90 güne yaymıştı; istenen, hepsinin 26.08.2026
-- görünmesi. Ekranda gün (gg.aa.yyyy) gösterildiği için gün 26.08.2026'ya çekiliyor;
-- sıralama tutarlı kalsın diye gün içinde sıra numarasına göre küçük dakika farkı verilir
-- (hepsi aynı güne düşer).

UPDATE "orders"
SET "createdAt" = TIMESTAMP '2026-08-26 12:00:00' - make_interval(mins => CAST(right("id", 4) AS integer))
WHERE "id" LIKE 'htx-imp-%';
