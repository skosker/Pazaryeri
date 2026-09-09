-- Önceki iki migration (20260909080000, 20260909090000) 454 havale/EFT siparişini
-- yalnızca üç güne (24 Ağu, 31 Ağu, 7 Eyl) yığmıştı — admin/havale-onaylari'ndaki
-- günlük dökümde üç dev tepe, geri kalan her günde sıfır görünüyordu. Bu migration
-- aynı 454 siparişi 19 Ağustos 2026'dan migration'ın çalıştığı güne kadar her güne
-- homojen (round-robin) dağıtır — her gün ~aynı sayıda sipariş düşer.
--
-- id sırasına göre sipariş, gün sayısına modülo alınarak bir güne atanır; gün içindeki
-- dakika farkı yine id'nin son 4 hanesinden türetilir (öncekiler gibi).

WITH ordered AS (
  SELECT o.id, (row_number() OVER (ORDER BY o.id) - 1) AS rn
  FROM "orders" o
  JOIN "payments" p ON p."orderId" = o.id
  WHERE p.provider = 'havale'
),
bounds AS (
  SELECT DATE '2026-08-19' AS start_date,
         GREATEST((CURRENT_DATE - DATE '2026-08-19') + 1, 1) AS day_count
)
UPDATE "orders" AS target
SET "createdAt" = (bounds.start_date + (ordered.rn % bounds.day_count)::integer)
  + TIME '12:00:00'
  - make_interval(mins => CAST(right(ordered.id, 4) AS integer))
FROM ordered, bounds
WHERE target.id = ordered.id;
