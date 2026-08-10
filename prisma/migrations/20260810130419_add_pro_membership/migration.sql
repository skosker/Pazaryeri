-- AlterTable
ALTER TABLE "users" ADD COLUMN "isPro" BOOLEAN NOT NULL DEFAULT false;

-- Deterministically mark ~20% of existing freelancers as "Pro" (admin-vetted
-- quality badge, curated like Fiverr Pro — demo data has no real vetting process).
UPDATE "users"
SET "isPro" = (('x' || substr(md5('pro-' || email), 1, 8))::bit(32)::bigint % 100) < 20
WHERE role = 'FREELANCER';
