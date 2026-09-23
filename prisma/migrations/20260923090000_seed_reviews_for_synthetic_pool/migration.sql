-- 20260810140000_seed_freelancer_reviews her freelancer'a sipariş/yorum geçmişi yazmıştı,
-- ama o tarihten sonra sentetik freelancer havuzu ~13 bine çıktı ve bu yeni profillerin
-- ilanları hiç yorum almadı — neredeyse her kartta "Henüz değerlendirme yok" yazıyordu.
--
-- Statik bir liste yerine o an veritabanında bulunan duruma göre çalışır: sentetik
-- (vitrin) freelancer'lara ait, yayında olup henüz hiç yorumu olmayan her ilanın yaklaşık
-- %70'ine 1-4 arası tamamlanmış sipariş + yorum ekler. Gerçek kullanıcıların ilanlarına
-- dokunulmaz. Kalan ~%30 "yeni satıcı" olarak kalır ki her ilanın yorumlu olması yapay
-- görünmesin. Zaten yorumu olan ilanlara dokunulmaz.
--
-- Alıcılar sentetik alıcı havuzundan (synthetic = true, admin'in varsayılan kullanıcı
-- listesinde görünmeyenler) rastgele seçilir; yorum metinleri ilk migration'daki havuzdan,
-- puana göre gelir.
--
-- Rastgele değerlerin hepsi satır başına hedef listede üretilip MATERIALIZED CTE'lerde
-- sabitlenir: ilişkisiz bir alt sorgunun içindeki random() Postgres'te InitPlan olarak tek
-- sefer çalışır (her satıra aynı alıcı düşerdi), ve siparişlerle yorumlar aynı satırı
-- okurken değerlerin değişmemesi gerekir.

WITH buyers AS MATERIALIZED (
  SELECT id, row_number() OVER (ORDER BY id) AS rn
  FROM "users"
  WHERE role = 'BUYER' AND synthetic = true AND suspended = false
),
buyer_count AS MATERIALIZED (
  SELECT count(*)::int AS n FROM buyers
),
eligible AS MATERIALIZED (
  SELECT
    g.id AS gig_id,
    p.id AS package_id,
    p.price,
    -- A review can't predate the gig or its seller's membership: the profile page shows
    -- "Üyelik: <ay yıl>", so an order dated before it would read as impossible.
    greatest(g."createdAt", s."createdAt") AS since,
    1 + floor(random() * 4)::int AS review_count
  FROM "gigs" g
  JOIN "users" s ON s.id = g."sellerId"
  JOIN LATERAL (
    SELECT id, price FROM "packages" WHERE "gigId" = g.id ORDER BY price ASC LIMIT 1
  ) p ON true
  WHERE g.published = true
    -- Only showcase profiles: a real sign-up's listing must never carry invented orders
    -- or reviews — buyers would read them as that person's track record.
    AND s.synthetic = true
    AND NOT EXISTS (SELECT 1 FROM "reviews" r WHERE r."gigId" = g.id)
    AND random() < 0.7
),
expanded AS MATERIALIZED (
  SELECT
    e.gig_id,
    e.package_id,
    e.price,
    'seed2-order-' || e.gig_id || '-' || gs.n AS order_id,
    'seed2-review-' || e.gig_id || '-' || gs.n AS review_id,
    1 + floor(random() * (SELECT n FROM buyer_count))::int AS buyer_rn,
    e.since + random() * (now() - e.since) AS at,
    random() AS rating_roll,
    random() AS comment_roll
  FROM eligible e
  CROSS JOIN LATERAL generate_series(1, e.review_count) AS gs(n)
),
rated AS MATERIALIZED (
  SELECT
    x.*,
    b.id AS buyer_id,
    CASE
      WHEN x.rating_roll < 0.03 THEN 2
      WHEN x.rating_roll < 0.12 THEN 3
      WHEN x.rating_roll < 0.45 THEN 4
      ELSE 5
    END AS rating
  FROM expanded x
  JOIN buyers b ON b.rn = x.buyer_rn
),
inserted_orders AS (
  INSERT INTO "orders" ("id", "status", "amount", "escrowReleased", "buyerId", "gigId", "packageId", "createdAt", "updatedAt")
  SELECT order_id, 'COMPLETED', price, true, buyer_id, gig_id, package_id, at, at
  FROM rated
  ON CONFLICT ("id") DO NOTHING
  RETURNING "id"
)
INSERT INTO "reviews" ("id", "rating", "comment", "orderId", "gigId", "buyerId", "createdAt")
SELECT
  r.review_id,
  r.rating,
  CASE r.rating
    WHEN 5 THEN (ARRAY[
      'Harika bir iş çıkardı, tam zamanında teslim etti. Kesinlikle tavsiye ederim!',
      'Profesyonel yaklaşım ve kaliteli işçilik. Tekrar çalışacağım kesinlikle.',
      'Detaylara gösterdiği özen gerçekten fark ediyor. Çok memnun kaldım.',
      'Beklediğimden çok daha iyi bir çalışma teslim aldım, teşekkürler!',
      'Beklentimin çok üzerinde bir sonuç aldım, iletişimi de çok iyiydi.',
      'Revizyon isteklerimi hızlıca ve özenle karşıladı, mükemmel deneyimdi.'
    ])[1 + floor(r.comment_roll * 6)::int]
    WHEN 4 THEN (ARRAY[
      'Kaliteli bir iş çıkardı, birkaç küçük revizyon gerekti ama sonuçtan memnunum.',
      'Genel olarak memnun kaldım, teslim süresi biraz uzadı ama sonuç iyiydi.',
      'İletişim güzeldi, iş de beklentimi karşıladı. Tavsiye ederim.'
    ])[1 + floor(r.comment_roll * 3)::int]
    WHEN 3 THEN (ARRAY[
      'İş fena değildi ama beklediğim seviyede değildi, ortalama bir deneyim.',
      'Ortalama bir çalışma oldu, birkaç revizyon sonrası kabul edilebilir hale geldi.'
    ])[1 + floor(r.comment_roll * 2)::int]
    ELSE 'Beklentimi karşılamadı, birkaç revizyona rağmen istediğim sonucu alamadım.'
  END,
  r.order_id,
  r.gig_id,
  r.buyer_id,
  r.at
FROM rated r
JOIN inserted_orders o ON o."id" = r.order_id
ON CONFLICT ("id") DO NOTHING;
