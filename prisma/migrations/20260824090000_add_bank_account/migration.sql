-- Havale/EFT hesabını admin panelinden düzenlenebilir hale getirir.
--
-- Bilgiler koda gömülüydü; hesap değiştiğinde yeni bir dağıtım gerekiyordu. Artık tek
-- satırlık bir tabloda duruyor ve /admin/banka ekranından güncelleniyor.
--
-- Satır, bugün ödeme sayfasında görünen gerçek hesapla açılıyor; böylece geçiş sırasında
-- alıcıya bir an bile boş ya da farklı bir IBAN gösterilmiyor.

CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "accountHolder" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

INSERT INTO "bank_accounts" ("id", "accountHolder", "bankName", "iban", "updatedAt")
VALUES (
    'default',
    'Prosinta Dijital Teknolojiler A.Ş.',
    'Garanti Bankası',
    'TR870006200070600006294611',
    now()
);
