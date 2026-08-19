-- Freelancer profile details: city, age and the list of things they actually do.
-- All nullable/defaulted, so existing accounts keep working without a backfill.
--
-- "synthetic" marks a generated showcase profile. The generator writes only rows that
-- carry it, which is what keeps a re-run away from real sign-ups.

ALTER TABLE "users" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "synthetic" BOOLEAN NOT NULL DEFAULT false;

-- The directory lists generated freelancers city by city and profession by profession.
CREATE INDEX "users_role_synthetic_idx" ON "users"("role", "synthetic");
