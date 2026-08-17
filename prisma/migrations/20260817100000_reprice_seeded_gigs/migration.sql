-- Move the demo catalogue onto 2026 Turkish market price levels.
--
-- The seed file is the source of truth for fresh installs, but existing databases
-- only pick up new prices when someone re-runs the seed against them. This
-- migration does the same repositioning in place, so a deploy is enough.
--
-- Scoped to gigs owned by seeded demo sellers (@profestia.dev) so listings created
-- by real users are never touched. Each statement carries its own band list because
-- migration statements do not share a transaction, which rules out temp tables.

-- Existing packages move onto the ladder: Temel 60%, Standart 100%, Premium 180%.
-- The base price is derived from the gig slug, so the spread is stable across runs.
WITH bands(slug, pmin, pmax) AS (
  VALUES ('grafik-tasarim', 1200, 6000), ('yazilim-web', 3500, 22000),
         ('yazi-ceviri', 500, 3500), ('video-animasyon', 1500, 9000),
         ('dijital-pazarlama', 2500, 14000), ('muzik-ses', 800, 5000),
         ('is-danismanlik', 3000, 17000), ('egitim-ders', 600, 4000),
         ('ai-otomasyon', 4000, 26000), ('veri-analitik', 3000, 19000)
),
base AS (
  SELECT g.id AS gig_id,
         GREATEST(50, round((
           b.pmin + ((('x' || substr(md5(g.slug), 1, 8))::bit(32)::int % (b.pmax - b.pmin + 1))
                     + (b.pmax - b.pmin + 1)) % (b.pmax - b.pmin + 1)
         )::numeric / 50) * 50)::numeric(10, 2) AS price
  FROM "gigs" g
  JOIN "categories" c ON c.id = g."categoryId"
  JOIN "users" u ON u.id = g."sellerId"
  JOIN bands b ON b.slug = c.slug
  WHERE u.email LIKE '%@profestia.dev'
)
UPDATE "packages" p
SET "price" = CASE p."tier"
    WHEN 'BASIC'   THEN GREATEST(50, round(base.price * 0.6 / 50) * 50)
    WHEN 'PREMIUM' THEN GREATEST(50, round(base.price * 1.8 / 50) * 50)
    ELSE base.price
  END
FROM base
WHERE p."gigId" = base.gig_id;

-- Gigs seeded after the original tier migration only carry STANDARD; give them the
-- missing rungs so every listing offers the same three-package choice.
WITH bands(slug, pmin, pmax) AS (
  VALUES ('grafik-tasarim', 1200, 6000), ('yazilim-web', 3500, 22000),
         ('yazi-ceviri', 500, 3500), ('video-animasyon', 1500, 9000),
         ('dijital-pazarlama', 2500, 14000), ('muzik-ses', 800, 5000),
         ('is-danismanlik', 3000, 17000), ('egitim-ders', 600, 4000),
         ('ai-otomasyon', 4000, 26000), ('veri-analitik', 3000, 19000)
),
base AS (
  SELECT g.id AS gig_id,
         GREATEST(50, round((
           b.pmin + ((('x' || substr(md5(g.slug), 1, 8))::bit(32)::int % (b.pmax - b.pmin + 1))
                     + (b.pmax - b.pmin + 1)) % (b.pmax - b.pmin + 1)
         )::numeric / 50) * 50)::numeric(10, 2) AS price
  FROM "gigs" g
  JOIN "categories" c ON c.id = g."categoryId"
  JOIN "users" u ON u.id = g."sellerId"
  JOIN bands b ON b.slug = c.slug
  WHERE u.email LIKE '%@profestia.dev'
)
INSERT INTO "packages" ("id", "tier", "name", "description", "price", "deliveryDays", "revisionCount", "features", "gigId")
SELECT
  gen_random_uuid()::text,
  t.tier::"PackageTier",
  t.name,
  t.description,
  GREATEST(50, round(base.price * t.factor / 50) * 50),
  GREATEST(1, std."deliveryDays" + t.day_shift),
  t.revisions,
  t.features,
  base.gig_id
FROM base
JOIN "packages" std ON std."gigId" = base.gig_id AND std."tier" = 'STANDARD'
CROSS JOIN (VALUES
  ('BASIC', 'Temel Paket', 'İhtiyacın olan temel çalışma. Tek konsept, sade teslimat.',
   0.6, 1, 1, ARRAY['Temel kapsam', '1 revizyon hakkı', 'Standart teslim']),
  ('PREMIUM', 'Premium Paket', 'Geniş kapsam, tüm kaynak dosyalar ve öncelikli teslimat.',
   1.8, -1, 4, ARRAY['Kaynak dosyalar dahil', 'Ticari kullanım lisansı', 'Öncelikli teslimat', '4 revizyon hakkı'])
) AS t(tier, name, description, factor, day_shift, revisions, features)
WHERE NOT EXISTS (
  SELECT 1 FROM "packages" x WHERE x."gigId" = base.gig_id AND x."tier" = t.tier::"PackageTier"
);
