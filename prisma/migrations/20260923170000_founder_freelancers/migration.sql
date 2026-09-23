-- AlterTable
ALTER TABLE "users" ADD COLUMN     "founderAt" TIMESTAMP(3),
ADD COLUMN     "founderNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "users_founderNumber_key" ON "users"("founderNumber");

-- Real freelancers who already have a live gig become the first Kurucu Freelancers, in
-- the order their first gig went up. Showcase profiles are excluded twice over: by the
-- synthetic flag and by their "!…" no-login password marker.
WITH ranked AS (
  SELECT u.id,
         row_number() OVER (ORDER BY min(g."createdAt"), u."createdAt", u.id) AS rn
  FROM "users" u
  JOIN "gigs" g ON g."sellerId" = u.id AND g.published = true
  WHERE u.role = 'FREELANCER'
    AND u.synthetic = false
    AND u.suspended = false
    AND u."passwordHash" NOT LIKE '!%'
  GROUP BY u.id, u."createdAt"
)
UPDATE "users" u
SET "founderNumber" = ranked.rn, "founderAt" = now()
FROM ranked
WHERE u.id = ranked.id AND ranked.rn <= 100;
