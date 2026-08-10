-- Insert subcategories and backfill subcategoryId on every gig (generated from prisma/bulk-gigs-data.ts).

INSERT INTO "subcategories" ("id", "name", "slug", "categoryId")
VALUES
  ('subcat-1', 'Logo Tasarımı', 'grafik-tasarim-logo-tasarimi', (SELECT id FROM "categories" WHERE slug = 'grafik-tasarim')),
  ('subcat-2', 'Kurumsal Kimlik', 'grafik-tasarim-kurumsal-kimlik', (SELECT id FROM "categories" WHERE slug = 'grafik-tasarim')),
  ('subcat-3', 'Sosyal Medya Tasarımları', 'grafik-tasarim-sosyal-medya-tasarimlari', (SELECT id FROM "categories" WHERE slug = 'grafik-tasarim')),
  ('subcat-4', 'Baskı & Ambalaj Tasarımı', 'grafik-tasarim-baski-ambalaj-tasarimi', (SELECT id FROM "categories" WHERE slug = 'grafik-tasarim')),
  ('subcat-5', 'İkon & İllüstrasyon', 'grafik-tasarim-i-kon-i-llustrasyon', (SELECT id FROM "categories" WHERE slug = 'grafik-tasarim')),
  ('subcat-6', 'Sunum Tasarımı', 'grafik-tasarim-sunum-tasarimi', (SELECT id FROM "categories" WHERE slug = 'grafik-tasarim')),
  ('subcat-7', 'Web Sitesi Geliştirme', 'yazilim-web-web-sitesi-gelistirme', (SELECT id FROM "categories" WHERE slug = 'yazilim-web')),
  ('subcat-8', 'E-ticaret Geliştirme', 'yazilim-web-e-ticaret-gelistirme', (SELECT id FROM "categories" WHERE slug = 'yazilim-web')),
  ('subcat-9', 'Mobil Uygulama Geliştirme', 'yazilim-web-mobil-uygulama-gelistirme', (SELECT id FROM "categories" WHERE slug = 'yazilim-web')),
  ('subcat-10', 'API & Entegrasyon', 'yazilim-web-api-entegrasyon', (SELECT id FROM "categories" WHERE slug = 'yazilim-web')),
  ('subcat-11', 'Özel Yazılım & Panel', 'yazilim-web-ozel-yazilim-panel', (SELECT id FROM "categories" WHERE slug = 'yazilim-web')),
  ('subcat-12', 'Teknik SEO & Performans', 'yazilim-web-teknik-seo-performans', (SELECT id FROM "categories" WHERE slug = 'yazilim-web')),
  ('subcat-13', 'İçerik & Blog Yazarlığı', 'yazi-ceviri-i-cerik-blog-yazarligi', (SELECT id FROM "categories" WHERE slug = 'yazi-ceviri')),
  ('subcat-14', 'Ürün & Web Metni', 'yazi-ceviri-urun-web-metni', (SELECT id FROM "categories" WHERE slug = 'yazi-ceviri')),
  ('subcat-15', 'Çeviri Hizmetleri', 'yazi-ceviri-ceviri-hizmetleri', (SELECT id FROM "categories" WHERE slug = 'yazi-ceviri')),
  ('subcat-16', 'Kariyer Metinleri', 'yazi-ceviri-kariyer-metinleri', (SELECT id FROM "categories" WHERE slug = 'yazi-ceviri')),
  ('subcat-17', 'Kurumsal & Akademik Metin', 'yazi-ceviri-kurumsal-akademik-metin', (SELECT id FROM "categories" WHERE slug = 'yazi-ceviri')),
  ('subcat-18', 'Sosyal Medya & Senaryo', 'yazi-ceviri-sosyal-medya-senaryo', (SELECT id FROM "categories" WHERE slug = 'yazi-ceviri')),
  ('subcat-19', 'Sosyal Medya Video Kurgu', 'video-animasyon-sosyal-medya-video-kurgu', (SELECT id FROM "categories" WHERE slug = 'video-animasyon')),
  ('subcat-20', 'Kurumsal & Reklam Filmi', 'video-animasyon-kurumsal-reklam-filmi', (SELECT id FROM "categories" WHERE slug = 'video-animasyon')),
  ('subcat-21', 'Logo & Motion Animasyon', 'video-animasyon-logo-motion-animasyon', (SELECT id FROM "categories" WHERE slug = 'video-animasyon')),
  ('subcat-22', 'Ürün & Tanıtım Videosu', 'video-animasyon-urun-tanitim-videosu', (SELECT id FROM "categories" WHERE slug = 'video-animasyon')),
  ('subcat-23', 'Etkinlik & Düğün Videosu', 'video-animasyon-etkinlik-dugun-videosu', (SELECT id FROM "categories" WHERE slug = 'video-animasyon')),
  ('subcat-24', 'Eğitim & Podcast Videosu', 'video-animasyon-egitim-podcast-videosu', (SELECT id FROM "categories" WHERE slug = 'video-animasyon')),
  ('subcat-25', 'Arama Motoru Reklamcılığı (SEM)', 'dijital-pazarlama-arama-motoru-reklamciligi-sem', (SELECT id FROM "categories" WHERE slug = 'dijital-pazarlama')),
  ('subcat-26', 'Sosyal Medya Reklamcılığı', 'dijital-pazarlama-sosyal-medya-reklamciligi', (SELECT id FROM "categories" WHERE slug = 'dijital-pazarlama')),
  ('subcat-27', 'SEO & İçerik Pazarlama', 'dijital-pazarlama-seo-i-cerik-pazarlama', (SELECT id FROM "categories" WHERE slug = 'dijital-pazarlama')),
  ('subcat-28', 'E-posta & Dönüşüm Pazarlama', 'dijital-pazarlama-e-posta-donusum-pazarlama', (SELECT id FROM "categories" WHERE slug = 'dijital-pazarlama')),
  ('subcat-29', 'Sosyal Medya Yönetimi', 'dijital-pazarlama-sosyal-medya-yonetimi', (SELECT id FROM "categories" WHERE slug = 'dijital-pazarlama')),
  ('subcat-30', 'Marka Stratejisi', 'dijital-pazarlama-marka-stratejisi', (SELECT id FROM "categories" WHERE slug = 'dijital-pazarlama')),
  ('subcat-31', 'Podcast Prodüksiyonu', 'muzik-ses-podcast-produksiyonu', (SELECT id FROM "categories" WHERE slug = 'muzik-ses')),
  ('subcat-32', 'Reklam & Jingle', 'muzik-ses-reklam-jingle', (SELECT id FROM "categories" WHERE slug = 'muzik-ses')),
  ('subcat-33', 'Seslendirme', 'muzik-ses-seslendirme', (SELECT id FROM "categories" WHERE slug = 'muzik-ses')),
  ('subcat-34', 'Müzik Besteleme & Beat', 'muzik-ses-muzik-besteleme-beat', (SELECT id FROM "categories" WHERE slug = 'muzik-ses')),
  ('subcat-35', 'Ses Efektleri & Mix', 'muzik-ses-ses-efektleri-mix', (SELECT id FROM "categories" WHERE slug = 'muzik-ses')),
  ('subcat-36', 'Video & Sunum Müziği', 'muzik-ses-video-sunum-muzigi', (SELECT id FROM "categories" WHERE slug = 'muzik-ses')),
  ('subcat-37', 'İş Planı & Finansal Danışmanlık', 'is-danismanlik-i-s-plani-finansal-danismanlik', (SELECT id FROM "categories" WHERE slug = 'is-danismanlik')),
  ('subcat-38', 'Pazarlama & Marka Danışmanlığı', 'is-danismanlik-pazarlama-marka-danismanligi', (SELECT id FROM "categories" WHERE slug = 'is-danismanlik')),
  ('subcat-39', 'İK & Kurumsal Eğitim', 'is-danismanlik-i-k-kurumsal-egitim', (SELECT id FROM "categories" WHERE slug = 'is-danismanlik')),
  ('subcat-40', 'Startup & Yatırımcı Danışmanlığı', 'is-danismanlik-startup-yatirimci-danismanligi', (SELECT id FROM "categories" WHERE slug = 'is-danismanlik')),
  ('subcat-41', 'Süreç & Proje Yönetimi', 'is-danismanlik-surec-proje-yonetimi', (SELECT id FROM "categories" WHERE slug = 'is-danismanlik')),
  ('subcat-42', 'Satış & E-ticaret Danışmanlığı', 'is-danismanlik-satis-e-ticaret-danismanligi', (SELECT id FROM "categories" WHERE slug = 'is-danismanlik')),
  ('subcat-43', 'Akademik Dersler', 'egitim-ders-akademik-dersler', (SELECT id FROM "categories" WHERE slug = 'egitim-ders')),
  ('subcat-44', 'Dil Eğitimi', 'egitim-ders-dil-egitimi', (SELECT id FROM "categories" WHERE slug = 'egitim-ders')),
  ('subcat-45', 'Yazılım & Ofis Eğitimi', 'egitim-ders-yazilim-ofis-egitimi', (SELECT id FROM "categories" WHERE slug = 'egitim-ders')),
  ('subcat-46', 'Tasarım & Dijital Beceri Eğitimi', 'egitim-ders-tasarim-dijital-beceri-egitimi', (SELECT id FROM "categories" WHERE slug = 'egitim-ders')),
  ('subcat-47', 'Sanat & Hobi Dersleri', 'egitim-ders-sanat-hobi-dersleri', (SELECT id FROM "categories" WHERE slug = 'egitim-ders')),
  ('subcat-48', 'Kişisel Gelişim & Kariyer Koçluğu', 'egitim-ders-kisisel-gelisim-kariyer-koclugu', (SELECT id FROM "categories" WHERE slug = 'egitim-ders')),
  ('subcat-49', 'Chatbot Geliştirme', 'ai-otomasyon-chatbot-gelistirme', (SELECT id FROM "categories" WHERE slug = 'ai-otomasyon')),
  ('subcat-50', 'İş Akışı Otomasyonu (Zapier/Make/n8n)', 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n', (SELECT id FROM "categories" WHERE slug = 'ai-otomasyon')),
  ('subcat-51', 'AI Asistan & İçerik Üretimi', 'ai-otomasyon-ai-asistan-i-cerik-uretimi', (SELECT id FROM "categories" WHERE slug = 'ai-otomasyon')),
  ('subcat-52', 'Veri & CRM Otomasyonu', 'ai-otomasyon-veri-crm-otomasyonu', (SELECT id FROM "categories" WHERE slug = 'ai-otomasyon')),
  ('subcat-53', 'AI Entegrasyonları', 'ai-otomasyon-ai-entegrasyonlari', (SELECT id FROM "categories" WHERE slug = 'ai-otomasyon')),
  ('subcat-54', 'AI Danışmanlığı & Raporlama', 'ai-otomasyon-ai-danismanligi-raporlama', (SELECT id FROM "categories" WHERE slug = 'ai-otomasyon')),
  ('subcat-55', 'Satış & Pazarlama Analitiği', 'veri-analitik-satis-pazarlama-analitigi', (SELECT id FROM "categories" WHERE slug = 'veri-analitik')),
  ('subcat-56', 'Dashboard & Raporlama (Power BI/Excel)', 'veri-analitik-dashboard-raporlama-power-bi-excel', (SELECT id FROM "categories" WHERE slug = 'veri-analitik')),
  ('subcat-57', 'Web & Trafik Analitiği', 'veri-analitik-web-trafik-analitigi', (SELECT id FROM "categories" WHERE slug = 'veri-analitik')),
  ('subcat-58', 'Müşteri & Test Analizi', 'veri-analitik-musteri-test-analizi', (SELECT id FROM "categories" WHERE slug = 'veri-analitik')),
  ('subcat-59', 'Veritabanı & SQL Analizi', 'veri-analitik-veritabani-sql-analizi', (SELECT id FROM "categories" WHERE slug = 'veri-analitik')),
  ('subcat-60', 'Finansal & Envanter Analizi', 'veri-analitik-finansal-envanter-analizi', (SELECT id FROM "categories" WHERE slug = 'veri-analitik'))
ON CONFLICT ("slug") DO NOTHING;

-- Backfill subcategoryId for the 480 bulk-generated gigs
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-logo-tasarimi') WHERE slug = 'minimalist-logonuzu-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-kurumsal-kimlik') WHERE slug = 'kurumsal-kimlik-paketinizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sosyal-medya-tasarimlari') WHERE slug = 'sosyal-medya-kapak-gorselinizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'ambalaj-tasariminizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'brosur-ve-katalog-tasariminizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-i-kon-i-llustrasyon') WHERE slug = 'i-nfografiginizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sosyal-medya-tasarimlari') WHERE slug = 'instagram-post-sablonunuzu-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'kartvizit-tasariminizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'el-ilani-flyer-tasariminizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sunum-tasarimi') WHERE slug = 'sunum-powerpoint-tasariminizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-i-kon-i-llustrasyon') WHERE slug = 'i-kon-setinizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'banner-ve-afis-tasariminizi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-logo-tasarimi') WHERE slug = 'minimalist-logonuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-kurumsal-kimlik') WHERE slug = 'kurumsal-kimlik-paketinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sosyal-medya-tasarimlari') WHERE slug = 'sosyal-medya-kapak-gorselinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'ambalaj-tasariminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'brosur-ve-katalog-tasariminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-i-kon-i-llustrasyon') WHERE slug = 'i-nfografiginizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sosyal-medya-tasarimlari') WHERE slug = 'instagram-post-sablonunuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'kartvizit-tasariminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'el-ilani-flyer-tasariminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sunum-tasarimi') WHERE slug = 'sunum-powerpoint-tasariminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-i-kon-i-llustrasyon') WHERE slug = 'i-kon-setinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'banner-ve-afis-tasariminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-logo-tasarimi') WHERE slug = 'minimalist-logonuzu-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-kurumsal-kimlik') WHERE slug = 'kurumsal-kimlik-paketinizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sosyal-medya-tasarimlari') WHERE slug = 'sosyal-medya-kapak-gorselinizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'ambalaj-tasariminizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'brosur-ve-katalog-tasariminizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-i-kon-i-llustrasyon') WHERE slug = 'i-nfografiginizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sosyal-medya-tasarimlari') WHERE slug = 'instagram-post-sablonunuzu-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'kartvizit-tasariminizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'el-ilani-flyer-tasariminizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sunum-tasarimi') WHERE slug = 'sunum-powerpoint-tasariminizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-i-kon-i-llustrasyon') WHERE slug = 'i-kon-setinizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'banner-ve-afis-tasariminizi-olusturuyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-logo-tasarimi') WHERE slug = 'minimalist-logonuzu-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-kurumsal-kimlik') WHERE slug = 'kurumsal-kimlik-paketinizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sosyal-medya-tasarimlari') WHERE slug = 'sosyal-medya-kapak-gorselinizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'ambalaj-tasariminizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'brosur-ve-katalog-tasariminizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-i-kon-i-llustrasyon') WHERE slug = 'i-nfografiginizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sosyal-medya-tasarimlari') WHERE slug = 'instagram-post-sablonunuzu-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'kartvizit-tasariminizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'el-ilani-flyer-tasariminizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sunum-tasarimi') WHERE slug = 'sunum-powerpoint-tasariminizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-i-kon-i-llustrasyon') WHERE slug = 'i-kon-setinizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-baski-ambalaj-tasarimi') WHERE slug = 'banner-ve-afis-tasariminizi-ciziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'wordpress-web-sitenizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-e-ticaret-gelistirme') WHERE slug = 'e-ticaret-magazanizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-mobil-uygulama-gelistirme') WHERE slug = 'mobil-uygulamanizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'landing-page-inizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-api-entegrasyon') WHERE slug = 'api-entegrasyonunuzu-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-ozel-yazilim-panel') WHERE slug = 'yonetim-panelinizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'chrome-eklentinizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-api-entegrasyon') WHERE slug = 'veritabani-yapinizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-e-ticaret-gelistirme') WHERE slug = 'odeme-altyapinizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-teknik-seo-performans') WHERE slug = 'seo-teknik-yapinizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-teknik-seo-performans') WHERE slug = 'web-sitenizin-hiz-performansini-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-ozel-yazilim-panel') WHERE slug = 'ozel-yazilim-projenizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'wordpress-web-sitenizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-e-ticaret-gelistirme') WHERE slug = 'e-ticaret-magazanizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-mobil-uygulama-gelistirme') WHERE slug = 'mobil-uygulamanizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'landing-page-inizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-api-entegrasyon') WHERE slug = 'api-entegrasyonunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-ozel-yazilim-panel') WHERE slug = 'yonetim-panelinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'chrome-eklentinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-api-entegrasyon') WHERE slug = 'veritabani-yapinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-e-ticaret-gelistirme') WHERE slug = 'odeme-altyapinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-teknik-seo-performans') WHERE slug = 'seo-teknik-yapinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-teknik-seo-performans') WHERE slug = 'web-sitenizin-hiz-performansini-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-ozel-yazilim-panel') WHERE slug = 'ozel-yazilim-projenizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'wordpress-web-sitenizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-e-ticaret-gelistirme') WHERE slug = 'e-ticaret-magazanizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-mobil-uygulama-gelistirme') WHERE slug = 'mobil-uygulamanizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'landing-page-inizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-api-entegrasyon') WHERE slug = 'api-entegrasyonunuzu-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-ozel-yazilim-panel') WHERE slug = 'yonetim-panelinizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'chrome-eklentinizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-api-entegrasyon') WHERE slug = 'veritabani-yapinizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-e-ticaret-gelistirme') WHERE slug = 'odeme-altyapinizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-teknik-seo-performans') WHERE slug = 'seo-teknik-yapinizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-teknik-seo-performans') WHERE slug = 'web-sitenizin-hiz-performansini-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-ozel-yazilim-panel') WHERE slug = 'ozel-yazilim-projenizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'wordpress-web-sitenizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-e-ticaret-gelistirme') WHERE slug = 'e-ticaret-magazanizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-mobil-uygulama-gelistirme') WHERE slug = 'mobil-uygulamanizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'landing-page-inizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-api-entegrasyon') WHERE slug = 'api-entegrasyonunuzu-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-ozel-yazilim-panel') WHERE slug = 'yonetim-panelinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'chrome-eklentinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-api-entegrasyon') WHERE slug = 'veritabani-yapinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-e-ticaret-gelistirme') WHERE slug = 'odeme-altyapinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-teknik-seo-performans') WHERE slug = 'seo-teknik-yapinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-teknik-seo-performans') WHERE slug = 'web-sitenizin-hiz-performansini-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-ozel-yazilim-panel') WHERE slug = 'ozel-yazilim-projenizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-i-cerik-blog-yazarligi') WHERE slug = 'blog-yazinizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-urun-web-metni') WHERE slug = 'urun-aciklama-metinlerinizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-i-cerik-blog-yazarligi') WHERE slug = 'seo-uyumlu-makalenizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-ceviri-hizmetleri') WHERE slug = 'e-kitabinizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-ceviri-hizmetleri') WHERE slug = 'i-ngilizce-turkce-belgenizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kariyer-metinleri') WHERE slug = 'cv-ve-on-yazinizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-urun-web-metni') WHERE slug = 'web-sitesi-metinlerinizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'basin-bulteninizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-sosyal-medya-senaryo') WHERE slug = 'sosyal-medya-metinlerinizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'sunum-metninizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'akademik-metninizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-sosyal-medya-senaryo') WHERE slug = 'senaryo-veya-diyalog-metninizi-yaziyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-i-cerik-blog-yazarligi') WHERE slug = 'blog-yazinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-urun-web-metni') WHERE slug = 'urun-aciklama-metinlerinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-i-cerik-blog-yazarligi') WHERE slug = 'seo-uyumlu-makalenizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-ceviri-hizmetleri') WHERE slug = 'e-kitabinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-ceviri-hizmetleri') WHERE slug = 'i-ngilizce-turkce-belgenizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kariyer-metinleri') WHERE slug = 'cv-ve-on-yazinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-urun-web-metni') WHERE slug = 'web-sitesi-metinlerinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'basin-bulteninizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-sosyal-medya-senaryo') WHERE slug = 'sosyal-medya-metinlerinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'sunum-metninizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'akademik-metninizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-sosyal-medya-senaryo') WHERE slug = 'senaryo-veya-diyalog-metninizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-i-cerik-blog-yazarligi') WHERE slug = 'blog-yazinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-urun-web-metni') WHERE slug = 'urun-aciklama-metinlerinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-i-cerik-blog-yazarligi') WHERE slug = 'seo-uyumlu-makalenizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-ceviri-hizmetleri') WHERE slug = 'e-kitabinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-ceviri-hizmetleri') WHERE slug = 'i-ngilizce-turkce-belgenizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kariyer-metinleri') WHERE slug = 'cv-ve-on-yazinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-urun-web-metni') WHERE slug = 'web-sitesi-metinlerinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'basin-bulteninizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-sosyal-medya-senaryo') WHERE slug = 'sosyal-medya-metinlerinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'sunum-metninizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'akademik-metninizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-sosyal-medya-senaryo') WHERE slug = 'senaryo-veya-diyalog-metninizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-i-cerik-blog-yazarligi') WHERE slug = 'blog-yazinizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-urun-web-metni') WHERE slug = 'urun-aciklama-metinlerinizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-i-cerik-blog-yazarligi') WHERE slug = 'seo-uyumlu-makalenizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-ceviri-hizmetleri') WHERE slug = 'e-kitabinizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-ceviri-hizmetleri') WHERE slug = 'i-ngilizce-turkce-belgenizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kariyer-metinleri') WHERE slug = 'cv-ve-on-yazinizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-urun-web-metni') WHERE slug = 'web-sitesi-metinlerinizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'basin-bulteninizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-sosyal-medya-senaryo') WHERE slug = 'sosyal-medya-metinlerinizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'sunum-metninizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-kurumsal-akademik-metin') WHERE slug = 'akademik-metninizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-sosyal-medya-senaryo') WHERE slug = 'senaryo-veya-diyalog-metninizi-ceviriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-sosyal-medya-video-kurgu') WHERE slug = 'youtube-videonuzu-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-sosyal-medya-video-kurgu') WHERE slug = 'reels-ve-tiktok-iceriginizi-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-kurumsal-reklam-filmi') WHERE slug = 'kurumsal-tanitim-filminizi-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'logo-animasyonunuzu-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-urun-tanitim-videosu') WHERE slug = 'urun-tanitim-videonuzu-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-etkinlik-dugun-videosu') WHERE slug = 'dugun-videonuzu-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-egitim-podcast-videosu') WHERE slug = 'podcast-videonuzu-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-egitim-podcast-videosu') WHERE slug = 'egitim-videonuzu-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-kurumsal-reklam-filmi') WHERE slug = 'reklam-filminizi-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'motion-graphic-iceriginizi-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'whiteboard-animasyonunuzu-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-etkinlik-dugun-videosu') WHERE slug = 'etkinlik-videonuzu-kurguluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-sosyal-medya-video-kurgu') WHERE slug = 'youtube-videonuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-sosyal-medya-video-kurgu') WHERE slug = 'reels-ve-tiktok-iceriginizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-kurumsal-reklam-filmi') WHERE slug = 'kurumsal-tanitim-filminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'logo-animasyonunuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-urun-tanitim-videosu') WHERE slug = 'urun-tanitim-videonuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-etkinlik-dugun-videosu') WHERE slug = 'dugun-videonuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-egitim-podcast-videosu') WHERE slug = 'podcast-videonuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-egitim-podcast-videosu') WHERE slug = 'egitim-videonuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-kurumsal-reklam-filmi') WHERE slug = 'reklam-filminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'motion-graphic-iceriginizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'whiteboard-animasyonunuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-etkinlik-dugun-videosu') WHERE slug = 'etkinlik-videonuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-sosyal-medya-video-kurgu') WHERE slug = 'youtube-videonuzu-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-sosyal-medya-video-kurgu') WHERE slug = 'reels-ve-tiktok-iceriginizi-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-kurumsal-reklam-filmi') WHERE slug = 'kurumsal-tanitim-filminizi-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'logo-animasyonunuzu-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-urun-tanitim-videosu') WHERE slug = 'urun-tanitim-videonuzu-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-etkinlik-dugun-videosu') WHERE slug = 'dugun-videonuzu-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-egitim-podcast-videosu') WHERE slug = 'podcast-videonuzu-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-egitim-podcast-videosu') WHERE slug = 'egitim-videonuzu-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-kurumsal-reklam-filmi') WHERE slug = 'reklam-filminizi-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'motion-graphic-iceriginizi-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'whiteboard-animasyonunuzu-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-etkinlik-dugun-videosu') WHERE slug = 'etkinlik-videonuzu-canlandiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-sosyal-medya-video-kurgu') WHERE slug = 'youtube-videonuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-sosyal-medya-video-kurgu') WHERE slug = 'reels-ve-tiktok-iceriginizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-kurumsal-reklam-filmi') WHERE slug = 'kurumsal-tanitim-filminizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'logo-animasyonunuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-urun-tanitim-videosu') WHERE slug = 'urun-tanitim-videonuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-etkinlik-dugun-videosu') WHERE slug = 'dugun-videonuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-egitim-podcast-videosu') WHERE slug = 'podcast-videonuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-egitim-podcast-videosu') WHERE slug = 'egitim-videonuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-kurumsal-reklam-filmi') WHERE slug = 'reklam-filminizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'motion-graphic-iceriginizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = 'whiteboard-animasyonunuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-etkinlik-dugun-videosu') WHERE slug = 'etkinlik-videonuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-arama-motoru-reklamciligi-sem') WHERE slug = 'google-ads-kampanyanizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-reklamciligi') WHERE slug = 'meta-facebook-instagram-reklamlarinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-seo-i-cerik-pazarlama') WHERE slug = 'seo-stratejinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'e-posta-pazarlama-akisinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-yonetimi') WHERE slug = 'sosyal-medya-hesaplarinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-seo-i-cerik-pazarlama') WHERE slug = 'i-cerik-pazarlama-takviminizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-reklamciligi') WHERE slug = 'tiktok-reklam-kampanyanizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-yonetimi') WHERE slug = 'influencer-is-birliklerinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-marka-stratejisi') WHERE slug = 'marka-konumlandirma-stratejinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-arama-motoru-reklamciligi-sem') WHERE slug = 'google-my-business-profilinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'donusum-orani-optimizasyonunuzu-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'e-ticaret-pazarlama-huninizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-arama-motoru-reklamciligi-sem') WHERE slug = 'google-ads-kampanyanizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-reklamciligi') WHERE slug = 'meta-facebook-instagram-reklamlarinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-seo-i-cerik-pazarlama') WHERE slug = 'seo-stratejinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'e-posta-pazarlama-akisinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-yonetimi') WHERE slug = 'sosyal-medya-hesaplarinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-seo-i-cerik-pazarlama') WHERE slug = 'i-cerik-pazarlama-takviminizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-reklamciligi') WHERE slug = 'tiktok-reklam-kampanyanizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-yonetimi') WHERE slug = 'influencer-is-birliklerinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-marka-stratejisi') WHERE slug = 'marka-konumlandirma-stratejinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-arama-motoru-reklamciligi-sem') WHERE slug = 'google-my-business-profilinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'donusum-orani-optimizasyonunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'e-ticaret-pazarlama-huninizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-arama-motoru-reklamciligi-sem') WHERE slug = 'google-ads-kampanyanizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-reklamciligi') WHERE slug = 'meta-facebook-instagram-reklamlarinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-seo-i-cerik-pazarlama') WHERE slug = 'seo-stratejinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'e-posta-pazarlama-akisinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-yonetimi') WHERE slug = 'sosyal-medya-hesaplarinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-seo-i-cerik-pazarlama') WHERE slug = 'i-cerik-pazarlama-takviminizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-reklamciligi') WHERE slug = 'tiktok-reklam-kampanyanizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-yonetimi') WHERE slug = 'influencer-is-birliklerinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-marka-stratejisi') WHERE slug = 'marka-konumlandirma-stratejinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-arama-motoru-reklamciligi-sem') WHERE slug = 'google-my-business-profilinizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'donusum-orani-optimizasyonunuzu-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'e-ticaret-pazarlama-huninizi-optimize-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-arama-motoru-reklamciligi-sem') WHERE slug = 'google-ads-kampanyanizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-reklamciligi') WHERE slug = 'meta-facebook-instagram-reklamlarinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-seo-i-cerik-pazarlama') WHERE slug = 'seo-stratejinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'e-posta-pazarlama-akisinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-yonetimi') WHERE slug = 'sosyal-medya-hesaplarinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-seo-i-cerik-pazarlama') WHERE slug = 'i-cerik-pazarlama-takviminizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-reklamciligi') WHERE slug = 'tiktok-reklam-kampanyanizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-yonetimi') WHERE slug = 'influencer-is-birliklerinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-marka-stratejisi') WHERE slug = 'marka-konumlandirma-stratejinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-arama-motoru-reklamciligi-sem') WHERE slug = 'google-my-business-profilinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'donusum-orani-optimizasyonunuzu-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-e-posta-donusum-pazarlama') WHERE slug = 'e-ticaret-pazarlama-huninizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-podcast-produksiyonu') WHERE slug = 'podcast-bolumunuzu-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-reklam-jingle') WHERE slug = 'reklam-filminiz-icin-jingle-i-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-seslendirme') WHERE slug = 'seslendirme-kaydinizi-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'sarki-duzenlemenizi-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-ses-efektleri-mix') WHERE slug = 'ses-efektlerinizi-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-video-sunum-muzigi') WHERE slug = 'youtube-kanalinizin-muziklerini-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-video-sunum-muzigi') WHERE slug = 'sunum-videonuzun-fon-muzigini-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-seslendirme') WHERE slug = 'telesekreter-mesajinizi-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-reklam-jingle') WHERE slug = 'radyo-spotunuzu-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'oyun-muziklerinizi-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'enstrumantal-beat-inizi-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-podcast-produksiyonu') WHERE slug = 'ses-kayit-post-produksiyonunuzu-kaydediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-podcast-produksiyonu') WHERE slug = 'podcast-bolumunuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-reklam-jingle') WHERE slug = 'reklam-filminiz-icin-jingle-i-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-seslendirme') WHERE slug = 'seslendirme-kaydinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'sarki-duzenlemenizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-ses-efektleri-mix') WHERE slug = 'ses-efektlerinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-video-sunum-muzigi') WHERE slug = 'youtube-kanalinizin-muziklerini-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-video-sunum-muzigi') WHERE slug = 'sunum-videonuzun-fon-muzigini-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-seslendirme') WHERE slug = 'telesekreter-mesajinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-reklam-jingle') WHERE slug = 'radyo-spotunuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'oyun-muziklerinizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'enstrumantal-beat-inizi-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-podcast-produksiyonu') WHERE slug = 'ses-kayit-post-produksiyonunuzu-duzenliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-podcast-produksiyonu') WHERE slug = 'podcast-bolumunuzu-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-reklam-jingle') WHERE slug = 'reklam-filminiz-icin-jingle-i-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-seslendirme') WHERE slug = 'seslendirme-kaydinizi-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'sarki-duzenlemenizi-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-ses-efektleri-mix') WHERE slug = 'ses-efektlerinizi-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-video-sunum-muzigi') WHERE slug = 'youtube-kanalinizin-muziklerini-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-video-sunum-muzigi') WHERE slug = 'sunum-videonuzun-fon-muzigini-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-seslendirme') WHERE slug = 'telesekreter-mesajinizi-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-reklam-jingle') WHERE slug = 'radyo-spotunuzu-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'oyun-muziklerinizi-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'enstrumantal-beat-inizi-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-podcast-produksiyonu') WHERE slug = 'ses-kayit-post-produksiyonunuzu-besteliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-podcast-produksiyonu') WHERE slug = 'podcast-bolumunuzu-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-reklam-jingle') WHERE slug = 'reklam-filminiz-icin-jingle-i-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-seslendirme') WHERE slug = 'seslendirme-kaydinizi-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'sarki-duzenlemenizi-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-ses-efektleri-mix') WHERE slug = 'ses-efektlerinizi-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-video-sunum-muzigi') WHERE slug = 'youtube-kanalinizin-muziklerini-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-video-sunum-muzigi') WHERE slug = 'sunum-videonuzun-fon-muzigini-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-seslendirme') WHERE slug = 'telesekreter-mesajinizi-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-reklam-jingle') WHERE slug = 'radyo-spotunuzu-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'oyun-muziklerinizi-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-muzik-besteleme-beat') WHERE slug = 'enstrumantal-beat-inizi-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-podcast-produksiyonu') WHERE slug = 'ses-kayit-post-produksiyonunuzu-miksliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-s-plani-finansal-danismanlik') WHERE slug = 'i-s-planinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-s-plani-finansal-danismanlik') WHERE slug = 'finansal-projeksiyonlarinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-pazarlama-marka-danismanligi') WHERE slug = 'pazarlama-stratejinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-k-kurumsal-egitim') WHERE slug = 'i-nsan-kaynaklari-sureclerinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-startup-yatirimci-danismanligi') WHERE slug = 'startup-danismanliginizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-startup-yatirimci-danismanligi') WHERE slug = 'yatirimci-sunumunuzu-pitch-deck-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-surec-proje-yonetimi') WHERE slug = 'surec-iyilestirme-calismanizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-pazarlama-marka-danismanligi') WHERE slug = 'marka-stratejinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-satis-e-ticaret-danismanligi') WHERE slug = 'satis-huninizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-surec-proje-yonetimi') WHERE slug = 'proje-yonetim-surecinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-satis-e-ticaret-danismanligi') WHERE slug = 'e-ticaret-operasyonunuzu-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-k-kurumsal-egitim') WHERE slug = 'kurumsal-egitim-programinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-s-plani-finansal-danismanlik') WHERE slug = 'i-s-planinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-s-plani-finansal-danismanlik') WHERE slug = 'finansal-projeksiyonlarinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-pazarlama-marka-danismanligi') WHERE slug = 'pazarlama-stratejinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-k-kurumsal-egitim') WHERE slug = 'i-nsan-kaynaklari-sureclerinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-startup-yatirimci-danismanligi') WHERE slug = 'startup-danismanliginizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-startup-yatirimci-danismanligi') WHERE slug = 'yatirimci-sunumunuzu-pitch-deck-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-surec-proje-yonetimi') WHERE slug = 'surec-iyilestirme-calismanizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-pazarlama-marka-danismanligi') WHERE slug = 'marka-stratejinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-satis-e-ticaret-danismanligi') WHERE slug = 'satis-huninizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-surec-proje-yonetimi') WHERE slug = 'proje-yonetim-surecinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-satis-e-ticaret-danismanligi') WHERE slug = 'e-ticaret-operasyonunuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-k-kurumsal-egitim') WHERE slug = 'kurumsal-egitim-programinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-s-plani-finansal-danismanlik') WHERE slug = 'i-s-planinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-s-plani-finansal-danismanlik') WHERE slug = 'finansal-projeksiyonlarinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-pazarlama-marka-danismanligi') WHERE slug = 'pazarlama-stratejinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-k-kurumsal-egitim') WHERE slug = 'i-nsan-kaynaklari-sureclerinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-startup-yatirimci-danismanligi') WHERE slug = 'startup-danismanliginizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-startup-yatirimci-danismanligi') WHERE slug = 'yatirimci-sunumunuzu-pitch-deck-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-surec-proje-yonetimi') WHERE slug = 'surec-iyilestirme-calismanizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-pazarlama-marka-danismanligi') WHERE slug = 'marka-stratejinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-satis-e-ticaret-danismanligi') WHERE slug = 'satis-huninizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-surec-proje-yonetimi') WHERE slug = 'proje-yonetim-surecinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-satis-e-ticaret-danismanligi') WHERE slug = 'e-ticaret-operasyonunuzu-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-k-kurumsal-egitim') WHERE slug = 'kurumsal-egitim-programinizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-s-plani-finansal-danismanlik') WHERE slug = 'i-s-planinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-s-plani-finansal-danismanlik') WHERE slug = 'finansal-projeksiyonlarinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-pazarlama-marka-danismanligi') WHERE slug = 'pazarlama-stratejinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-k-kurumsal-egitim') WHERE slug = 'i-nsan-kaynaklari-sureclerinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-startup-yatirimci-danismanligi') WHERE slug = 'startup-danismanliginizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-startup-yatirimci-danismanligi') WHERE slug = 'yatirimci-sunumunuzu-pitch-deck-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-surec-proje-yonetimi') WHERE slug = 'surec-iyilestirme-calismanizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-pazarlama-marka-danismanligi') WHERE slug = 'marka-stratejinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-satis-e-ticaret-danismanligi') WHERE slug = 'satis-huninizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-surec-proje-yonetimi') WHERE slug = 'proje-yonetim-surecinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-satis-e-ticaret-danismanligi') WHERE slug = 'e-ticaret-operasyonunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-i-k-kurumsal-egitim') WHERE slug = 'kurumsal-egitim-programinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-akademik-dersler') WHERE slug = 'matematik-dersinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-dil-egitimi') WHERE slug = 'i-ngilizce-konusma-pratiginizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-yazilim-ofis-egitimi') WHERE slug = 'yazilim-egitiminizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'grafik-tasarim-egitiminizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-sanat-hobi-dersleri') WHERE slug = 'gitar-dersinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-akademik-dersler') WHERE slug = 'sinav-hazirlik-programinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-yazilim-ofis-egitimi') WHERE slug = 'excel-egitiminizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'dijital-pazarlama-egitiminizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-sanat-hobi-dersleri') WHERE slug = 'fotografcilik-dersinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'yoga-ve-nefes-dersinizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'kisisel-gelisim-koclugunuzu-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'kariyer-danismanliginizi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-akademik-dersler') WHERE slug = 'matematik-dersinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-dil-egitimi') WHERE slug = 'i-ngilizce-konusma-pratiginizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-yazilim-ofis-egitimi') WHERE slug = 'yazilim-egitiminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'grafik-tasarim-egitiminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-sanat-hobi-dersleri') WHERE slug = 'gitar-dersinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-akademik-dersler') WHERE slug = 'sinav-hazirlik-programinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-yazilim-ofis-egitimi') WHERE slug = 'excel-egitiminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'dijital-pazarlama-egitiminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-sanat-hobi-dersleri') WHERE slug = 'fotografcilik-dersinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'yoga-ve-nefes-dersinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'kisisel-gelisim-koclugunuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'kariyer-danismanliginizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-akademik-dersler') WHERE slug = 'matematik-dersinizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-dil-egitimi') WHERE slug = 'i-ngilizce-konusma-pratiginizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-yazilim-ofis-egitimi') WHERE slug = 'yazilim-egitiminizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'grafik-tasarim-egitiminizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-sanat-hobi-dersleri') WHERE slug = 'gitar-dersinizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-akademik-dersler') WHERE slug = 'sinav-hazirlik-programinizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-yazilim-ofis-egitimi') WHERE slug = 'excel-egitiminizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'dijital-pazarlama-egitiminizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-sanat-hobi-dersleri') WHERE slug = 'fotografcilik-dersinizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'yoga-ve-nefes-dersinizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'kisisel-gelisim-koclugunuzu-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'kariyer-danismanliginizi-anlatiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-akademik-dersler') WHERE slug = 'matematik-dersinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-dil-egitimi') WHERE slug = 'i-ngilizce-konusma-pratiginizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-yazilim-ofis-egitimi') WHERE slug = 'yazilim-egitiminizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'grafik-tasarim-egitiminizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-sanat-hobi-dersleri') WHERE slug = 'gitar-dersinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-akademik-dersler') WHERE slug = 'sinav-hazirlik-programinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-yazilim-ofis-egitimi') WHERE slug = 'excel-egitiminizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'dijital-pazarlama-egitiminizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-sanat-hobi-dersleri') WHERE slug = 'fotografcilik-dersinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'yoga-ve-nefes-dersinizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'kisisel-gelisim-koclugunuzu-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-kisisel-gelisim-kariyer-koclugu') WHERE slug = 'kariyer-danismanliginizi-planliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-chatbot-gelistirme') WHERE slug = 'musteri-destek-chatbotunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n') WHERE slug = 'zapier-make-is-akislarinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-asistan-i-cerik-uretimi') WHERE slug = 'chatgpt-tabanli-asistaninizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-veri-crm-otomasyonu') WHERE slug = 'veri-girisi-sureclerinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-entegrasyonlari') WHERE slug = 'e-posta-otomasyonunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-chatbot-gelistirme') WHERE slug = 'whatsapp-bot-entegrasyonunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-asistan-i-cerik-uretimi') WHERE slug = 'i-cerik-uretim-otomasyonunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-veri-crm-otomasyonu') WHERE slug = 'crm-otomasyon-akisinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-danismanligi-raporlama') WHERE slug = 'ai-destekli-rapor-sisteminizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-entegrasyonlari') WHERE slug = 'ses-metin-ai-entegrasyonunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n') WHERE slug = 'n8n-otomasyon-senaryonuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-danismanligi-raporlama') WHERE slug = 'yapay-zeka-danismanlik-surecinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-chatbot-gelistirme') WHERE slug = 'musteri-destek-chatbotunuzu-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n') WHERE slug = 'zapier-make-is-akislarinizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-asistan-i-cerik-uretimi') WHERE slug = 'chatgpt-tabanli-asistaninizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-veri-crm-otomasyonu') WHERE slug = 'veri-girisi-sureclerinizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-entegrasyonlari') WHERE slug = 'e-posta-otomasyonunuzu-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-chatbot-gelistirme') WHERE slug = 'whatsapp-bot-entegrasyonunuzu-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-asistan-i-cerik-uretimi') WHERE slug = 'i-cerik-uretim-otomasyonunuzu-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-veri-crm-otomasyonu') WHERE slug = 'crm-otomasyon-akisinizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-danismanligi-raporlama') WHERE slug = 'ai-destekli-rapor-sisteminizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-entegrasyonlari') WHERE slug = 'ses-metin-ai-entegrasyonunuzu-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n') WHERE slug = 'n8n-otomasyon-senaryonuzu-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-danismanligi-raporlama') WHERE slug = 'yapay-zeka-danismanlik-surecinizi-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-chatbot-gelistirme') WHERE slug = 'musteri-destek-chatbotunuzu-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n') WHERE slug = 'zapier-make-is-akislarinizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-asistan-i-cerik-uretimi') WHERE slug = 'chatgpt-tabanli-asistaninizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-veri-crm-otomasyonu') WHERE slug = 'veri-girisi-sureclerinizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-entegrasyonlari') WHERE slug = 'e-posta-otomasyonunuzu-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-chatbot-gelistirme') WHERE slug = 'whatsapp-bot-entegrasyonunuzu-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-asistan-i-cerik-uretimi') WHERE slug = 'i-cerik-uretim-otomasyonunuzu-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-veri-crm-otomasyonu') WHERE slug = 'crm-otomasyon-akisinizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-danismanligi-raporlama') WHERE slug = 'ai-destekli-rapor-sisteminizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-entegrasyonlari') WHERE slug = 'ses-metin-ai-entegrasyonunuzu-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n') WHERE slug = 'n8n-otomasyon-senaryonuzu-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-danismanligi-raporlama') WHERE slug = 'yapay-zeka-danismanlik-surecinizi-entegre-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-chatbot-gelistirme') WHERE slug = 'musteri-destek-chatbotunuzu-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n') WHERE slug = 'zapier-make-is-akislarinizi-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-asistan-i-cerik-uretimi') WHERE slug = 'chatgpt-tabanli-asistaninizi-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-veri-crm-otomasyonu') WHERE slug = 'veri-girisi-sureclerinizi-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-entegrasyonlari') WHERE slug = 'e-posta-otomasyonunuzu-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-chatbot-gelistirme') WHERE slug = 'whatsapp-bot-entegrasyonunuzu-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-asistan-i-cerik-uretimi') WHERE slug = 'i-cerik-uretim-otomasyonunuzu-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-veri-crm-otomasyonu') WHERE slug = 'crm-otomasyon-akisinizi-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-danismanligi-raporlama') WHERE slug = 'ai-destekli-rapor-sisteminizi-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-entegrasyonlari') WHERE slug = 'ses-metin-ai-entegrasyonunuzu-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n') WHERE slug = 'n8n-otomasyon-senaryonuzu-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-ai-danismanligi-raporlama') WHERE slug = 'yapay-zeka-danismanlik-surecinizi-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-satis-pazarlama-analitigi') WHERE slug = 'satis-verilerinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'power-bi-panelinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-web-trafik-analitigi') WHERE slug = 'google-analytics-kurulumunuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'excel-raporlama-sisteminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-musteri-test-analizi') WHERE slug = 'musteri-segmentasyonunuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-satis-pazarlama-analitigi') WHERE slug = 'pazarlama-performans-raporunuzu-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-veritabani-sql-analizi') WHERE slug = 'sql-veritabani-sorgularinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-musteri-test-analizi') WHERE slug = 'a-b-test-analizinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'kpi-izleme-panelinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-finansal-envanter-analizi') WHERE slug = 'finansal-veri-modelinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-finansal-envanter-analizi') WHERE slug = 'envanter-analiz-sisteminizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-web-trafik-analitigi') WHERE slug = 'web-sitesi-trafik-analizinizi-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-satis-pazarlama-analitigi') WHERE slug = 'satis-verilerinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'power-bi-panelinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-web-trafik-analitigi') WHERE slug = 'google-analytics-kurulumunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'excel-raporlama-sisteminizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-musteri-test-analizi') WHERE slug = 'musteri-segmentasyonunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-satis-pazarlama-analitigi') WHERE slug = 'pazarlama-performans-raporunuzu-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-veritabani-sql-analizi') WHERE slug = 'sql-veritabani-sorgularinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-musteri-test-analizi') WHERE slug = 'a-b-test-analizinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'kpi-izleme-panelinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-finansal-envanter-analizi') WHERE slug = 'finansal-veri-modelinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-finansal-envanter-analizi') WHERE slug = 'envanter-analiz-sisteminizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-web-trafik-analitigi') WHERE slug = 'web-sitesi-trafik-analizinizi-kuruyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-satis-pazarlama-analitigi') WHERE slug = 'satis-verilerinizi-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'power-bi-panelinizi-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-web-trafik-analitigi') WHERE slug = 'google-analytics-kurulumunuzu-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'excel-raporlama-sisteminizi-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-musteri-test-analizi') WHERE slug = 'musteri-segmentasyonunuzu-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-satis-pazarlama-analitigi') WHERE slug = 'pazarlama-performans-raporunuzu-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-veritabani-sql-analizi') WHERE slug = 'sql-veritabani-sorgularinizi-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-musteri-test-analizi') WHERE slug = 'a-b-test-analizinizi-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'kpi-izleme-panelinizi-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-finansal-envanter-analizi') WHERE slug = 'finansal-veri-modelinizi-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-finansal-envanter-analizi') WHERE slug = 'envanter-analiz-sisteminizi-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-web-trafik-analitigi') WHERE slug = 'web-sitesi-trafik-analizinizi-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-satis-pazarlama-analitigi') WHERE slug = 'satis-verilerinizi-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'power-bi-panelinizi-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-web-trafik-analitigi') WHERE slug = 'google-analytics-kurulumunuzu-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'excel-raporlama-sisteminizi-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-musteri-test-analizi') WHERE slug = 'musteri-segmentasyonunuzu-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-satis-pazarlama-analitigi') WHERE slug = 'pazarlama-performans-raporunuzu-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-veritabani-sql-analizi') WHERE slug = 'sql-veritabani-sorgularinizi-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-musteri-test-analizi') WHERE slug = 'a-b-test-analizinizi-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'kpi-izleme-panelinizi-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-finansal-envanter-analizi') WHERE slug = 'finansal-veri-modelinizi-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-finansal-envanter-analizi') WHERE slug = 'envanter-analiz-sisteminizi-raporluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-web-trafik-analitigi') WHERE slug = 'web-sitesi-trafik-analizinizi-raporluyorum';

-- Backfill subcategoryId for the 20 flagship gigs
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-yonetimi') WHERE slug = 'sosyal-medya-icerik-tasarimi-yapiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-web-sitesi-gelistirme') WHERE slug = 'kurumsal-web-siteniz-icin-on-yuz-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-i-cerik-blog-yazarligi') WHERE slug = 'seo-uyumlu-blog-yazilari-ve-icerik-uretiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-kurumsal-kimlik') WHERE slug = 'profesyonel-logo-ve-marka-kimligi-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-sosyal-medya-video-kurgu') WHERE slug = 'youtube-ve-reels-icin-video-kurgusu-yapiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'dijital-pazarlama-sosyal-medya-reklamciligi') WHERE slug = 'google-meta-reklam-kampanyanizi-yonetiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazilim-web-e-ticaret-gelistirme') WHERE slug = 'e-ticaret-siteniz-icin-odeme-entegrasyonu-yapiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'grafik-tasarim-sosyal-medya-tasarimlari') WHERE slug = 'urun-katalogunuz-icin-sosyal-medya-postu-tasarliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'yazi-ceviri-ceviri-hizmetleri') WHERE slug = 'i-ngilizce-turkce-profesyonel-ceviri-yapiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'video-animasyon-logo-motion-animasyon') WHERE slug = '2d-logo-animasyonu-ve-marka-intro-su-hazirliyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-podcast-produksiyonu') WHERE slug = 'podcast-ve-video-icin-ses-miksaji-ve-duzenleme-yapiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'muzik-ses-video-sunum-muzigi') WHERE slug = 'sosyal-medya-videolariniz-icin-muzik-ve-seslendirme-buluyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-pazarlama-marka-danismanligi') WHERE slug = 'kucuk-isletmeler-icin-pazarlama-stratejisi-danismanligi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'is-danismanlik-surec-proje-yonetimi') WHERE slug = 'yazilim-projeniz-icin-teknik-danismanlik-ve-kod-incelemesi-yapiyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'i-cerik-yazarligi-ve-seo-uzerine-birebir-online-ders-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'egitim-ders-tasarim-dijital-beceri-egitimi') WHERE slug = 'grafik-tasarim-temelleri-online-egitimi-veriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-i-s-akisi-otomasyonu-zapier-make-n8n') WHERE slug = 'zapier-make-ile-is-sureclerinizi-otomatiklestiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'ai-otomasyon-chatbot-gelistirme') WHERE slug = 'chatgpt-claude-entegrasyonlu-ai-chatbot-gelistiriyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-satis-pazarlama-analitigi') WHERE slug = 'i-sletmeniz-icin-satis-ve-pazarlama-verilerini-analiz-ediyorum';
UPDATE "gigs" SET "subcategoryId" = (SELECT id FROM "subcategories" WHERE slug = 'veri-analitik-dashboard-raporlama-power-bi-excel') WHERE slug = 'excel-power-bi-ile-interaktif-veri-paneli-dashboard-hazirliyorum';

