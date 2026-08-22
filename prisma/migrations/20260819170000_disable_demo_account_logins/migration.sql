-- Demo hesaplarının girişini kapat.
--
-- Seed, gösterim amaçlı bütün hesaplara "password123" veriyordu ve bu şifre giriş
-- sayfasında açıkça yazılıydı. Yani siteye giren herkes 179 hesaptan (128 freelancer,
-- 51 alıcı) herhangi biriyle oturum açıp ilan düzenleyebiliyor, silebiliyor, IBAN
-- girebiliyordu. Katalog gerçek kullanıcılara açılmadan önce kapatılması gereken bir
-- kapı.
--
-- Hesaplar siliniyor değil: ilanları, profilleri ve yorumları sitede duruyor. Yalnızca
-- passwordHash, bcrypt formatında olmayan bir işarete çevriliyor. bcrypt.compare böyle
-- bir değere karşı hata fırlatmadan false döndüğü için giriş sessizce reddediliyor —
-- sentetik profiller için zaten kullanılan kalıbın aynısı.
--
-- ADMIN hesabına dokunulmuyor: paneli yöneten gerçek giriş o.

UPDATE "users"
SET "passwordHash" = '!demo-account-no-login'
WHERE "role" <> 'ADMIN'
  AND "email" LIKE '%@profestia.dev'
  AND "passwordHash" LIKE '$2%';
