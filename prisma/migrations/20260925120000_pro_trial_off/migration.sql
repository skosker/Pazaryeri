-- AlterTable
ALTER TABLE "site_settings" ALTER COLUMN "proTrialEnabled" SET DEFAULT false;


-- Ucretsiz Pro denemesi kaldirildi (admin ayarlardan yeniden acilabilir).
UPDATE "site_settings" SET "proTrialEnabled" = false;
