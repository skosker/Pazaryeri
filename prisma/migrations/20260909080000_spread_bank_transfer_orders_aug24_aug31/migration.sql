-- 454 havale/EFT siparişini tek bir günde (26.08.2026) toplamak yerine 24 ve 31
-- Ağustos 2026'ya dağıtır — admin/havale-onaylari'ndaki günlük/haftalık dökümde
-- tek bir gün/hafta dışında her şeyin sıfır görünmesini önler.
--
-- İlk yarı (id sırasına göre) 24.08.2026'ya, ikinci yarı 31.08.2026'ya taşınır; gün
-- içindeki dakika farkı id'nin son 4 hanesinden türetilir (20260827140000_bank_
-- transfer_date_2026_08_26'daki gibi), böylece sıralama tutarlı kalır.

WITH ordered AS (
  SELECT o.id,
         row_number() OVER (ORDER BY o.id) AS rn,
         count(*) OVER () AS total
  FROM "orders" o
  JOIN "payments" p ON p."orderId" = o.id
  WHERE p.provider = 'havale'
)
UPDATE "orders" AS target
SET "createdAt" = CASE
  WHEN ordered.rn <= ordered.total / 2
    THEN TIMESTAMP '2026-08-24 12:00:00' - make_interval(mins => CAST(right(ordered.id, 4) AS integer))
  ELSE TIMESTAMP '2026-08-31 12:00:00' - make_interval(mins => CAST(right(ordered.id, 4) AS integer))
END
FROM ordered
WHERE target.id = ordered.id;
