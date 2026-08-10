-- AlterTable
ALTER TABLE "users" ADD COLUMN "isOnline" BOOLEAN NOT NULL DEFAULT false;

-- Deterministically mark ~35% of existing freelancers as online, for the
-- "show online freelancers" filter (demo data has no real presence tracking).
UPDATE "users"
SET "isOnline" = (('x' || substr(md5(email), 1, 8))::bit(32)::bigint % 100) < 35
WHERE role = 'FREELANCER';
