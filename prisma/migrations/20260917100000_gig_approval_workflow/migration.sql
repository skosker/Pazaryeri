-- Freelancer'ların yeni ilan girişleri artık admin onayına tabi: "status" sütunu,
-- "published" alanından ayrı bir moderasyon durumu tutar. Var olan tüm satırlar ve bu
-- sütunu hiç belirtmeyen her üretici/seed script'i (bump-, catboost-, named- vb.)
-- DEFAULT 'APPROVED' sayesinde eskisi gibi anında yayınlanmaya devam eder; yalnızca
-- gerçek freelancer'ın "ilan oluştur" akışı bu satırı PENDING olarak işaretler.

-- CreateEnum
CREATE TYPE "GigStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "gigs" ADD COLUMN "status" "GigStatus" NOT NULL DEFAULT 'APPROVED';
