-- Önceki migration (20260909080000) 454 havale/EFT siparişini 24 ve 31 Ağustos'a
-- ikiye bölmüştü; bu migration üçe bölerek bir kısmını Eylül'e de taşır — admin/
-- havale-onaylari'ndaki günlük/haftalık/aylık dökümde Eylül ayı da veri içersin diye.
--
-- id sırasına göre ~üçte bir 24.08.2026'da, ~üçte bir 31.08.2026'da kalır, kalan
-- ~üçte biri 07.09.2026'ya taşınır. Gün içindeki dakika farkı yine id'nin son 4
-- hanesinden türetilir, sıralama tutarlı kalır.

WITH ordered AS (
  SELECT o.id,
         row_number() OVER (ORDER BY o.id) AS rn,
         count(*) OVER () AS total
  FROM "orders" o
  JOIN "payments" p ON p."orderId" = o.id
  WHERE p.provider = 'havale'
)
UPDATE "orders" AS target
SET "createdAt" = CASE ((ordered.rn - 1) * 3 / ordered.total)
  WHEN 0 THEN TIMESTAMP '2026-08-24 12:00:00' - make_interval(mins => CAST(right(ordered.id, 4) AS integer))
  WHEN 1 THEN TIMESTAMP '2026-08-31 12:00:00' - make_interval(mins => CAST(right(ordered.id, 4) AS integer))
  ELSE TIMESTAMP '2026-09-07 12:00:00' - make_interval(mins => CAST(right(ordered.id, 4) AS integer))
END
FROM ordered
WHERE target.id = ordered.id;
