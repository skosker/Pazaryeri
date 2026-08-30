-- Önceden var olan vitrin satıcılarının (8 isimli demo hesap + fl1..fl200) biyografisinde
-- kalmış olabilecek şehir bahsini temizler.
--
-- Bu satıcıların bio'su canlı ilan verisine (uzmanlık alanları) bağlı olarak üretildiği
-- için önceki migration'daki gibi tam yeniden üretim güvenli değil — bunun yerine
-- prisma/synthetic-freelancers.ts'in eski dört şablonunun ürettiği tam cümle kalıplarını
-- (regexp_replace ile) tanıyıp yalnızca şehir geçen kısmı çıkarıyor; şu anda canlıda ne
-- yazıyorsa onun üzerinde çalışır, üretecin yeniden çalıştırılmasına ihtiyaç duymaz.
-- Zaten şehir bahsi kalmamış satırlarda hiçbir WHERE koşulu eşleşmez, no-op olur.

UPDATE "users"
SET "bio" = regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    "bio",
                    '\S+ yaşıyorum, tüm Türkiye''ye uzaktan hizmet veriyorum\.$',
                    'Tüm Türkiye''ye uzaktan hizmet veriyorum.'
                  ),
                  '\S+ merkezli çalışıyorum, verdiğim teslim tarihine sadık kalıyorum\.$',
                  'Verdiğim teslim tarihine sadık kalıyorum.'
                ),
                ' Konum: \S+\.$',
                ''
              ),
              '^\S+ yaşıyorum ve ',
              ''
            )
WHERE "role" = 'FREELANCER'
  AND (
    "bio" ~ 'yaşıyorum, tüm Türkiye''ye uzaktan hizmet veriyorum\.$'
    OR "bio" ~ 'merkezli çalışıyorum, verdiğim teslim tarihine sadık kalıyorum\.$'
    OR "bio" ~ 'Konum: \S+\.$'
    OR "bio" ~ '^\S+ yaşıyorum ve '
  );
