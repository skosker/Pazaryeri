-- Gösterim hesaplarının e-posta adreslerini yeni markaya taşı.
--
-- Marka Prosinta oldu ama seed'den gelen 1259 hesap hâlâ @profestia.dev adresini
-- taşıyordu. Yeni adres olarak @prosinta.com değil @demo.prosinta.com seçildi: bu
-- hesaplar sahte, gerçek alan adına ait bir kutuya düşmemeleri gerekiyor. Alt alanın
-- MX kaydı olmadığı için oraya gönderilen hiçbir posta teslim edilemez.
--
-- ADMIN hesabı dışarıda: paneli yöneten gerçek giriş o, adresi ayrıca ve bilinçli
-- olarak taşınacak.

UPDATE "users"
SET "email" = replace("email", '@profestia.dev', '@demo.prosinta.com')
WHERE "email" LIKE '%@profestia.dev'
  AND "role" <> 'ADMIN';
