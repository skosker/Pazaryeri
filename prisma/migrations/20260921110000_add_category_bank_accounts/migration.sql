-- Kategori bazlı şirket IBAN'ları. `active = false` olarak eklenir: admin panelinde
-- (/admin/banka) görünür ve yönetilebilir, ama getBankAccounts() sadece active=true
-- olanları döndürdüğü için ödeme sayfasında (checkout) kullanıcıya gösterilmez.
-- Hazır olduğunda admin panelinden "Aktif Et" ile tek tek açılabilir.

INSERT INTO "bank_accounts" ("id", "accountHolder", "bankName", "iban", "active", "createdAt", "updatedAt")
VALUES
  ('bank-cat-ai-otomasyon', 'Prosinta Dijital Teknolojiler A.Ş. - AI & Otomasyon', '***', 'TR850083801825001866455467', false, now(), now()),
  ('bank-cat-yazilim-web', 'Prosinta Dijital Teknolojiler A.Ş. - Yazılım & Web', '***', 'TR540083801825001736318788', false, now(), now()),
  ('bank-cat-grafik-tasarim', 'Prosinta Dijital Teknolojiler A.Ş. - Grafik Tasarım', '***', 'TR540083801825001936277304', false, now(), now()),
  ('bank-cat-dijital-pazarlama', 'Prosinta Dijital Teknolojiler A.Ş. - Dijital Pazarlama', '***', 'TR370083801825001662043866', false, now(), now()),
  ('bank-cat-veri-analitik', 'Prosinta Dijital Teknolojiler A.Ş. - Veri & Analitik', '***', 'TR800083801825001752692502', false, now(), now()),
  ('bank-cat-is-danismanlik', 'Prosinta Dijital Teknolojiler A.Ş. - İş & Danışmanlık', '***', 'TR900083801825001179266443', false, now(), now()),
  ('bank-cat-yazi-ceviri', 'Prosinta Dijital Teknolojiler A.Ş. - Yazı & Çeviri', '***', 'TR080083801825000043265902', false, now(), now()),
  ('bank-cat-video-animasyon', 'Prosinta Dijital Teknolojiler A.Ş. - Video & Animasyon', '***', 'TR230083801825001215674174', false, now(), now()),
  ('bank-cat-egitim-ders', 'Prosinta Dijital Teknolojiler A.Ş. - Eğitim & Ders', '***', 'TR140083801825000997235671', false, now(), now()),
  ('bank-cat-muzik-ses', 'Prosinta Dijital Teknolojiler A.Ş. - Müzik & Ses', '***', 'TR190083801825000355403653', false, now(), now())
ON CONFLICT ("id") DO NOTHING;
