-- Bütün üyelerin üyelik tarihini (createdAt) Ağustos 2026'ya sabitler.
--
-- Freelancer profil sayfası "üye tarihi"ni createdAt'ten türetiyor ("Temmuz 2026'dan beri
-- üye" gibi). Ana sayfadaki "ilk haftamızda 5.000 üyeye ulaştık" duyurusuyla tutarlı
-- olması için hiçbir üyenin bundan farklı bir tarihte katılmış görünmemesi gerekiyor —
-- rol/sentetik ayrımı yapılmadan tüm "users" satırlarına uygulanır.
--
-- Tarih, id'nin hash'inden türetilerek 1-28 Ağustos 2026 aralığına (bugüne kadar, ileri
-- tarihli üye olmasın diye) deterministik şekilde yayılır — aynı migration tekrar
-- çalıştırılsa bile aynı sonucu verir.

UPDATE "users"
SET "createdAt" = TIMESTAMP '2026-08-01 00:00:00'
                 + make_interval(secs => abs(hashtext(id)) % (28 * 24 * 3600));
