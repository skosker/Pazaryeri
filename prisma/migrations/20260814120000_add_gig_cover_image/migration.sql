-- AlterTable
ALTER TABLE "gigs" ADD COLUMN "coverImage" TEXT;

-- CreateTable
CREATE TABLE "uploaded_images" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_images_pkey" PRIMARY KEY ("id")
);
