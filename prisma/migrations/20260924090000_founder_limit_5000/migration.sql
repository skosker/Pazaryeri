-- Kurucu Freelancer kontenjanı 100'den 5000'e.
ALTER TABLE "site_settings" ALTER COLUMN "founderLimit" SET DEFAULT 5000;

-- Ayarlar admin panelinden bir kez kaydedildiyse satırdaki değer de güncellensin.
UPDATE "site_settings" SET "founderLimit" = 5000 WHERE id = 1;

-- Eski 100 sınırı yüzünden rozet alamamış, ilanı yayında olan gerçek freelancer'lar
-- (kampanya açıksa) kalınan sıradan numaralandırılır. Vitrin profilleri hariç.
WITH settings AS (
  SELECT COALESCE((SELECT "founderEnabled" FROM "site_settings" WHERE id = 1), true) AS enabled,
         COALESCE((SELECT "founderLimit" FROM "site_settings" WHERE id = 1), 5000) AS lim
),
taken AS (
  SELECT COALESCE(max("founderNumber"), 0) AS last FROM "users"
),
ranked AS (
  SELECT u.id,
         row_number() OVER (ORDER BY min(g."createdAt"), u."createdAt", u.id) AS rn
  FROM "users" u
  JOIN "gigs" g ON g."sellerId" = u.id AND g.published = true
  WHERE u.role = 'FREELANCER'
    AND u.synthetic = false
    AND u.suspended = false
    AND u."passwordHash" NOT LIKE '!%'
    AND u."founderNumber" IS NULL
  GROUP BY u.id, u."createdAt"
)
UPDATE "users" u
SET "founderNumber" = taken.last + ranked.rn, "founderAt" = now()
FROM ranked, taken, settings
WHERE u.id = ranked.id
  AND settings.enabled
  AND taken.last + ranked.rn <= settings.lim;
