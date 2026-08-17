-- Add the third wave of demo freelancers (fl121..fl200) and give them listings.
--
-- The seed already generates these accounts, but an existing database only picks
-- them up when someone re-runs the seed against it, which needs a DATABASE_URL
-- nobody can read back. Creating them here means a deploy is enough.
--
-- Passwords are deliberately unusable: these are showcase profiles, not accounts
-- anyone should log into. bcrypt.compare returns false for a non-hash like this
-- rather than throwing.

INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "title", "bio", "emailVerified", "suspended", "isOnline", "isPro", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  v.name,
  v.email,
  '!showcase-profile-no-login',
  'FREELANCER'::"Role",
  v.title,
  v.title || ' olarak ' || split_part(v.name, ' ', 1) || ', Profestia''da profesyonel hizmet veriyor.',
  now(),
  false,
  (abs(hashtext(v.email)) % 3) = 0,
  (abs(hashtext(v.email)) % 7) = 0,
  now(),
  now()
FROM (VALUES
  ('fl121@profestia.dev', 'Ahmet A.', 'Grafik Tasarımcı'),
  ('fl122@profestia.dev', 'Mehmet B.', 'Grafik Tasarımcı'),
  ('fl123@profestia.dev', 'Fatma C.', 'Grafik Tasarımcı'),
  ('fl124@profestia.dev', 'Emre D.', 'Grafik Tasarımcı'),
  ('fl125@profestia.dev', 'Selin E.', 'Grafik Tasarımcı'),
  ('fl126@profestia.dev', 'Kerem F.', 'Grafik Tasarımcı'),
  ('fl127@profestia.dev', 'Ece G.', 'Grafik Tasarımcı'),
  ('fl128@profestia.dev', 'Onur H.', 'Grafik Tasarımcı'),
  ('fl129@profestia.dev', 'Buse K.', 'Yazılım Geliştirici'),
  ('fl130@profestia.dev', 'Kaan L.', 'Yazılım Geliştirici'),
  ('fl131@profestia.dev', 'Yusuf M.', 'Yazılım Geliştirici'),
  ('fl132@profestia.dev', 'Ceren N.', 'Yazılım Geliştirici'),
  ('fl133@profestia.dev', 'Barış O.', 'Yazılım Geliştirici'),
  ('fl134@profestia.dev', 'Gizem P.', 'Yazılım Geliştirici'),
  ('fl135@profestia.dev', 'Tolga R.', 'Yazılım Geliştirici'),
  ('fl136@profestia.dev', 'Naz S.', 'Yazılım Geliştirici'),
  ('fl137@profestia.dev', 'Serkan T.', 'İçerik Yazarı'),
  ('fl138@profestia.dev', 'Pelin U.', 'İçerik Yazarı'),
  ('fl139@profestia.dev', 'Emir V.', 'İçerik Yazarı'),
  ('fl140@profestia.dev', 'İrem Y.', 'İçerik Yazarı'),
  ('fl141@profestia.dev', 'Volkan A.', 'İçerik Yazarı'),
  ('fl142@profestia.dev', 'Sude B.', 'İçerik Yazarı'),
  ('fl143@profestia.dev', 'Berk C.', 'İçerik Yazarı'),
  ('fl144@profestia.dev', 'Melis D.', 'İçerik Yazarı'),
  ('fl145@profestia.dev', 'Arda E.', 'Video Editörü'),
  ('fl146@profestia.dev', 'Cem F.', 'Video Editörü'),
  ('fl147@profestia.dev', 'Hazal G.', 'Video Editörü'),
  ('fl148@profestia.dev', 'Umut H.', 'Video Editörü'),
  ('fl149@profestia.dev', 'Sena K.', 'Video Editörü'),
  ('fl150@profestia.dev', 'Cansu L.', 'Video Editörü'),
  ('fl151@profestia.dev', 'Efe M.', 'Video Editörü'),
  ('fl152@profestia.dev', 'Yasemin N.', 'Video Editörü'),
  ('fl153@profestia.dev', 'Alp O.', 'Dijital Pazarlama Uzmanı'),
  ('fl154@profestia.dev', 'Derya P.', 'Dijital Pazarlama Uzmanı'),
  ('fl155@profestia.dev', 'Oğuz R.', 'Dijital Pazarlama Uzmanı'),
  ('fl156@profestia.dev', 'Nil S.', 'Dijital Pazarlama Uzmanı'),
  ('fl157@profestia.dev', 'Kemal T.', 'Dijital Pazarlama Uzmanı'),
  ('fl158@profestia.dev', 'Beril U.', 'Dijital Pazarlama Uzmanı'),
  ('fl159@profestia.dev', 'Tarık V.', 'Dijital Pazarlama Uzmanı'),
  ('fl160@profestia.dev', 'Sibel Y.', 'Dijital Pazarlama Uzmanı'),
  ('fl161@profestia.dev', 'Gökhan A.', 'Ses Mühendisi'),
  ('fl162@profestia.dev', 'Aylin B.', 'Ses Mühendisi'),
  ('fl163@profestia.dev', 'Baran C.', 'Ses Mühendisi'),
  ('fl164@profestia.dev', 'Merve D.', 'Ses Mühendisi'),
  ('fl165@profestia.dev', 'İlker E.', 'Ses Mühendisi'),
  ('fl166@profestia.dev', 'Nihan F.', 'Ses Mühendisi'),
  ('fl167@profestia.dev', 'Doruk G.', 'Ses Mühendisi'),
  ('fl168@profestia.dev', 'Simge H.', 'Ses Mühendisi'),
  ('fl169@profestia.dev', 'Batu K.', 'İş Danışmanı'),
  ('fl170@profestia.dev', 'Ceyda L.', 'İş Danışmanı'),
  ('fl171@profestia.dev', 'Uğur M.', 'İş Danışmanı'),
  ('fl172@profestia.dev', 'Damla N.', 'İş Danışmanı'),
  ('fl173@profestia.dev', 'Eren O.', 'İş Danışmanı'),
  ('fl174@profestia.dev', 'Selen P.', 'İş Danışmanı'),
  ('fl175@profestia.dev', 'Koray R.', 'İş Danışmanı'),
  ('fl176@profestia.dev', 'Aslıhan S.', 'İş Danışmanı'),
  ('fl177@profestia.dev', 'Fırat T.', 'Eğitmen'),
  ('fl178@profestia.dev', 'Duygu U.', 'Eğitmen'),
  ('fl179@profestia.dev', 'Kağan V.', 'Eğitmen'),
  ('fl180@profestia.dev', 'Ebru Y.', 'Eğitmen'),
  ('fl181@profestia.dev', 'Bora A.', 'Eğitmen'),
  ('fl182@profestia.dev', 'Elvan B.', 'Eğitmen'),
  ('fl183@profestia.dev', 'Sarp C.', 'Eğitmen'),
  ('fl184@profestia.dev', 'Yağmur D.', 'Eğitmen'),
  ('fl185@profestia.dev', 'Kutay E.', 'AI & Otomasyon Danışmanı'),
  ('fl186@profestia.dev', 'Zehra F.', 'AI & Otomasyon Danışmanı'),
  ('fl187@profestia.dev', 'Metin G.', 'AI & Otomasyon Danışmanı'),
  ('fl188@profestia.dev', 'Aycan H.', 'AI & Otomasyon Danışmanı'),
  ('fl189@profestia.dev', 'Rüya K.', 'AI & Otomasyon Danışmanı'),
  ('fl190@profestia.dev', 'Kıvanç L.', 'AI & Otomasyon Danışmanı'),
  ('fl191@profestia.dev', 'Esin M.', 'AI & Otomasyon Danışmanı'),
  ('fl192@profestia.dev', 'Bertan N.', 'AI & Otomasyon Danışmanı'),
  ('fl193@profestia.dev', 'Nurcan O.', 'Veri Analisti'),
  ('fl194@profestia.dev', 'Tayfun P.', 'Veri Analisti'),
  ('fl195@profestia.dev', 'Gamze R.', 'Veri Analisti'),
  ('fl196@profestia.dev', 'Erhan S.', 'Veri Analisti'),
  ('fl197@profestia.dev', 'Buğra T.', 'Veri Analisti'),
  ('fl198@profestia.dev', 'Sinem U.', 'Veri Analisti'),
  ('fl199@profestia.dev', 'Cenk V.', 'Veri Analisti'),
  ('fl200@profestia.dev', 'Aybüke Y.', 'Veri Analisti')
) AS v(email, name, title)
WHERE NOT EXISTS (SELECT 1 FROM "users" u WHERE u.email = v.email);

-- Spread existing listings over the new sellers so the profiles are reachable.
-- Only gigs without orders move, so nothing a buyer already paid for changes hands.
WITH yeni AS (
  SELECT u.id, u.title,
         row_number() OVER (PARTITION BY u.title ORDER BY u.email) AS sira,
         count(*) OVER (PARTITION BY u.title) AS toplam
  FROM "users" u
  WHERE u."passwordHash" = '!showcase-profile-no-login'
),
tasinabilir AS (
  SELECT g.id, s.title AS seller_title,
         row_number() OVER (PARTITION BY s.title ORDER BY g.slug) AS sira
  FROM "gigs" g
  JOIN "users" s ON s.id = g."sellerId"
  WHERE NOT EXISTS (SELECT 1 FROM "orders" o WHERE o."gigId" = g.id)
)
UPDATE "gigs" g
SET "sellerId" = y.id
FROM tasinabilir t
JOIN yeni y ON y.title = t.seller_title AND y.sira = ((t.sira - 1) % y.toplam) + 1
WHERE g.id = t.id AND (t.sira % 3) = 0;
