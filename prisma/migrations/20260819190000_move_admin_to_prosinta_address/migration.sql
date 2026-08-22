-- Admin hesabını gerçek alan adına taşı.
--
-- Hesap admin@profestia.dev adresiyle seed edilmişti; o alan adı artık ne markanın ne
-- de sahibinin. Şifre sıfırlama bağlantısı hesabın adresine gittiği için, erişilebilir
-- olmayan bir adres kilitli kapı demek. admin@prosinta.com hem markayla tutarlı hem de
-- Natro'daki kurumsal posta kutusuyla okunabilir.
--
-- Şifre değişmiyor; yalnızca giriş adresi değişiyor.
--
-- NOT EXISTS koruması, hedef adresle zaten bir hesap varsa çakışmayı önlüyor: email
-- benzersiz bir alan, koşulsuz UPDATE bu durumda migration'ı ve dolayısıyla deploy'u
-- düşürürdü.

UPDATE "users"
SET "email" = 'admin@prosinta.com'
WHERE "email" = 'admin@profestia.dev'
  AND "role" = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM "users" existing WHERE existing."email" = 'admin@prosinta.com'
  );
