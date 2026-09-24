
-- AlterTable
ALTER TABLE "gigs" DROP COLUMN "campaignPercent";

-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "campaignEnabled",
DROP COLUMN "campaignEnd",
DROP COLUMN "campaignMaxPercent",
DROP COLUMN "campaignMinPercent",
DROP COLUMN "campaignName",
DROP COLUMN "campaignStart";

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "minPercent" INTEGER NOT NULL DEFAULT 10,
    "maxPercent" INTEGER NOT NULL DEFAULT 50,
    "proDiscountPercent" INTEGER NOT NULL DEFAULT 0,
    "boostDiscountPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_entries" (
    "percent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,

    CONSTRAINT "campaign_entries_pkey" PRIMARY KEY ("campaignId","gigId")
);

-- CreateIndex
CREATE INDEX "campaign_entries_gigId_idx" ON "campaign_entries"("gigId");

-- AddForeignKey
ALTER TABLE "campaign_entries" ADD CONSTRAINT "campaign_entries_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_entries" ADD CONSTRAINT "campaign_entries_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "gigs"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- The columns are UTC without a zone, so Istanbul midnights are converted explicitly.
-- The two campaigns planned so far, both switched off until an admin opens them.
INSERT INTO "campaigns" ("id", "name", "tagline", "enabled", "start", "end", "minPercent", "maxPercent", "proDiscountPercent", "boostDiscountPercent", "createdAt", "updatedAt")
VALUES
  ('kampanya-freelancer-gunu-2026', 'Freelancer Günü', '19 Ekim Uluslararası Freelancer Günü: bağımsız çalışanların emeğini kutluyoruz.', false,
   ('2026-10-19 00:00:00+03'::timestamptz AT TIME ZONE 'UTC'), ('2026-10-20 00:00:00+03'::timestamptz AT TIME ZONE 'UTC'), 10, 50, 50, 50, now(), now()),
  ('kampanya-efsane-cuma-2026', 'Efsane Cuma', 'Freelancer''ların kendi belirlediği indirimlerle, Prosinta güvencesinde.', false,
   ('2026-11-23 00:00:00+03'::timestamptz AT TIME ZONE 'UTC'), ('2026-12-01 00:00:00+03'::timestamptz AT TIME ZONE 'UTC'), 10, 50, 0, 0, now(), now())
ON CONFLICT ("id") DO NOTHING;
