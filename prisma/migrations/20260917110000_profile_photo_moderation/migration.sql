-- Gerçek kullanıcılar artık kendi profil fotoğraflarını yükleyebiliyor. Yüklenen foto
-- otomatik bir uygunluk denetiminden geçer; denetim "uygunsuz olabilir" derse foto doğrudan
-- "image"e yazılmaz, admin onayı bekleyene kadar "pendingImage"de tutulur.

-- AlterTable
ALTER TABLE "users" ADD COLUMN "pendingImage" TEXT,
ADD COLUMN "photoFlagReason" TEXT;
