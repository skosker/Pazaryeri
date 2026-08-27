-- İçe aktarılan havale kayıtlarını onaylanmış (PAID) duruma çeker.
--
-- 20260827120000 migration'ı önce bekleyen (PENDING_VERIFICATION) haliyle uygulanıp
-- kaydedildiği için, sonradan PAID'e çevrilen içerik yeniden çalışmadı; kayıtlar canlıda
-- "onay bekliyor" görünüyordu. Bu migration durumu kesin olarak düzeltir: siparişleri
-- PAID, 'havale' ödemelerini SUCCESS yapar. Idempotent — zaten PAID olanları atlar.

UPDATE "orders"
SET "status" = 'PAID'
WHERE "id" LIKE 'htx-imp-%' AND "status" = 'PENDING_VERIFICATION';

UPDATE "payments"
SET "status" = 'SUCCESS'
WHERE "id" LIKE 'htx-pay-%' AND "status" <> 'SUCCESS';
