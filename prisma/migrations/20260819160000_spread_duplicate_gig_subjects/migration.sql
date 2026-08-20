-- Aynı freelancer'da tekrarlayan ilan konularını dağıt.
--
-- Toplu ilan üreticisi konuyu i %% konu_sayısı, satıcıyı i %% satıcı_sayısı ile
-- seçiyordu. İki periyodun ortak böleni olduğunda bir satıcı hep aynı konulara
-- düşüyor ve profilinde "Ürün tanıtım videonuzu düzenliyorum / kurguluyorum /
-- canlandırıyorum" gibi yalnızca fiili değişen ilanlar yan yana diziliyor.
-- Üretici düzeltildi; bu migration halihazırda yazılmış satırları onarıyor.
--
-- Onarım ilanı yeniden adlandırmıyor, sahibini değiştiriyor: başlık, slug ve
-- dolayısıyla kapak görseli olduğu gibi kalıyor. Yeni sahip her zaman aynı
-- kategoride ilan veren ve o konuyu hiç kullanmamış bir freelancer oluyor.
-- Siparişi olan ilanlara dokunulmuyor — sahibini değiştirmek geçmiş hakedişin
-- kime ait olduğunu bozardı.

WITH subjects(subject) AS (VALUES
    ('Minimalist logonuzu'),
    ('Kurumsal kimlik paketinizi'),
    ('Sosyal medya kapak görselinizi'),
    ('Ambalajınızı'),
    ('Broşür ve kataloğunuzu'),
    ('İnfografiğinizi'),
    ('Instagram post şablonunuzu'),
    ('Kartvizitinizi'),
    ('El ilanınızı (flyer)'),
    ('Sunumunuzu (PowerPoint)'),
    ('İkon setinizi'),
    ('Banner ve afişinizi'),
    ('WordPress web sitenizi'),
    ('E-ticaret mağazanızı'),
    ('Mobil uygulamanızı'),
    ('Landing page''inizi'),
    ('API entegrasyonunuzu'),
    ('Yönetim panelinizi'),
    ('Chrome eklentinizi'),
    ('Veritabanı yapınızı'),
    ('Ödeme altyapınızı'),
    ('SEO teknik yapınızı'),
    ('Web sitenizin hız performansını'),
    ('Özel yazılım projenizi'),
    ('Blog yazınızı'),
    ('Ürün açıklama metinlerinizi'),
    ('SEO uyumlu makalenizi'),
    ('E-kitabınızı'),
    ('İngilizce-Türkçe belgenizi'),
    ('CV ve ön yazınızı'),
    ('Web sitesi metinlerinizi'),
    ('Basın bülteninizi'),
    ('Sosyal medya metinlerinizi'),
    ('Sunum metninizi'),
    ('Akademik metninizi'),
    ('Senaryo veya diyalog metninizi'),
    ('Youtube videonuzu'),
    ('Reels ve TikTok içeriğinizi'),
    ('Kurumsal tanıtım filminizi'),
    ('Logo animasyonunuzu'),
    ('Ürün tanıtım videonuzu'),
    ('Düğün videonuzu'),
    ('Podcast videonuzu'),
    ('Eğitim videonuzu'),
    ('Reklam filminizi'),
    ('Motion graphic içeriğinizi'),
    ('Whiteboard animasyonunuzu'),
    ('Etkinlik videonuzu'),
    ('Google Ads kampanyanızı'),
    ('Meta (Facebook/Instagram) reklamlarınızı'),
    ('SEO stratejinizi'),
    ('E-posta pazarlama akışınızı'),
    ('Sosyal medya hesaplarınızı'),
    ('İçerik pazarlama takviminizi'),
    ('TikTok reklam kampanyanızı'),
    ('Influencer iş birliklerinizi'),
    ('Marka konumlandırma stratejinizi'),
    ('Google My Business profilinizi'),
    ('Dönüşüm oranı optimizasyonunuzu'),
    ('E-ticaret pazarlama huninizi'),
    ('Podcast bölümünüzü'),
    ('Reklam filminiz için jingle''ı'),
    ('Seslendirme kaydınızı'),
    ('Şarkı düzenlemenizi'),
    ('Ses efektlerinizi'),
    ('Youtube kanalınızın müziklerini'),
    ('Sunum videonuzun fon müziğini'),
    ('Telesekreter mesajınızı'),
    ('Radyo spotunuzu'),
    ('Oyun müziklerinizi'),
    ('Enstrümantal beat''inizi'),
    ('Ses kayıt post prodüksiyonunuzu'),
    ('İş planınızı'),
    ('Finansal projeksiyonlarınızı'),
    ('Pazarlama stratejinizi'),
    ('İnsan kaynakları süreçlerinizi'),
    ('Startup danışmanlığınızı'),
    ('Yatırımcı sunumunuzu (pitch deck)'),
    ('Süreç iyileştirme çalışmanızı'),
    ('Marka stratejinizi'),
    ('Satış huninizi'),
    ('Proje yönetim sürecinizi'),
    ('E-ticaret operasyonunuzu'),
    ('Kurumsal eğitim programınızı'),
    ('Matematik dersinizi'),
    ('İngilizce konuşma pratiğinizi'),
    ('Yazılım eğitiminizi'),
    ('Grafik tasarım eğitiminizi'),
    ('Gitar dersinizi'),
    ('Sınav hazırlık programınızı'),
    ('Excel eğitiminizi'),
    ('Dijital pazarlama eğitiminizi'),
    ('Fotoğrafçılık dersinizi'),
    ('Yoga ve nefes dersinizi'),
    ('Kişisel gelişim koçluğunuzu'),
    ('Kariyer danışmanlığınızı'),
    ('Müşteri destek chatbotunuzu'),
    ('Zapier/Make iş akışlarınızı'),
    ('ChatGPT tabanlı asistanınızı'),
    ('Veri girişi süreçlerinizi'),
    ('E-posta otomasyonunuzu'),
    ('WhatsApp bot entegrasyonunuzu'),
    ('İçerik üretim otomasyonunuzu'),
    ('CRM otomasyon akışınızı'),
    ('AI destekli rapor sisteminizi'),
    ('Ses/metin AI entegrasyonunuzu'),
    ('n8n otomasyon senaryonuzu'),
    ('Yapay zeka danışmanlık sürecinizi'),
    ('Satış verilerinizi'),
    ('Power BI panelinizi'),
    ('Google Analytics kurulumunuzu'),
    ('Excel raporlama sisteminizi'),
    ('Müşteri segmentasyonunuzu'),
    ('Pazarlama performans raporunuzu'),
    ('SQL veritabanı sorgularınızı'),
    ('A/B test analizinizi'),
    ('KPI izleme panelinizi'),
    ('Finansal veri modelinizi'),
    ('Envanter analiz sisteminizi'),
    ('Web sitesi trafik analizinizi')
),
gs AS (
  SELECT g.id,
         g."sellerId",
         g."categoryId",
         (SELECT s.subject FROM subjects s
           WHERE g.title LIKE s.subject || ' %%'
           ORDER BY length(s.subject) DESC
           LIMIT 1) AS subject
  FROM gigs g
),
cat_sellers AS (
  -- Kategorinin kendi freelancer'ları: unvanları o kategoriye göre yazılmış.
  SELECT DISTINCT "categoryId", "sellerId" FROM gs
),
cat_subjects AS (
  SELECT DISTINCT "categoryId", subject FROM gs WHERE subject IS NOT NULL
),
to_move AS (
  SELECT id,
         "categoryId",
         subject,
         ROW_NUMBER() OVER (PARTITION BY "categoryId", subject ORDER BY id) AS rn
  FROM (
    SELECT g.id,
           g."categoryId",
           g.subject,
           ROW_NUMBER() OVER (PARTITION BY g."sellerId", g.subject ORDER BY g.id) AS copy_no
    FROM gs g
    WHERE g.subject IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM orders o WHERE o."gigId" = g.id)
  ) ranked
  WHERE copy_no > 1  -- ilk kopya sahibinde kalır, fazlalıklar taşınır
),
free_sellers AS (
  SELECT cs."categoryId",
         cst.subject,
         cs."sellerId",
         ROW_NUMBER() OVER (PARTITION BY cs."categoryId", cst.subject ORDER BY cs."sellerId") AS rn
  FROM cat_sellers cs
  JOIN cat_subjects cst ON cst."categoryId" = cs."categoryId"
  WHERE NOT EXISTS (
    SELECT 1 FROM gs g
    WHERE g."sellerId" = cs."sellerId" AND g.subject = cst.subject
  )
)
UPDATE gigs
SET "sellerId" = f."sellerId"
FROM to_move m
JOIN free_sellers f
  ON f."categoryId" = m."categoryId"
 AND f.subject = m.subject
 AND f.rn = m.rn          -- her boş satıcıya en fazla bir ilan
WHERE gigs.id = m.id;
