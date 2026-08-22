# Prosinta

"İşini bilen freelancer'larla projeni hayata geçir" — Türkçe bir hizmet pazaryeri (Fiverr benzeri) uygulaması. Next.js (App Router), PostgreSQL/Prisma, NextAuth ve iyzico ödeme altyapısı ile inşa edilmiş gerçek bir web uygulamasıdır.

## Özellikler

- **Kayıt / Giriş**: E-posta + şifre ile kimlik doğrulama (NextAuth v5, bcrypt ile hashlenmiş şifreler), Alıcı / Freelancer rol seçimi.
- **Veritabanı**: PostgreSQL üzerinde Prisma ORM ile ilişkisel şema (User, Category, Gig, Package, Order, Payment, Review).
- **Gig listeleme**: Kategori, bütçe ve teslim süresi filtreleriyle hizmet arama; gig detay sayfası ve paket satın alma akışı.
- **Ödeme altyapısı**: iyzico Checkout Form entegrasyonu (gerçek API anahtarları tanımlandığında canlı çalışır). Anahtar tanımlı değilse otomatik olarak **mock ödeme modunda** çalışır, böylece iyzico hesabı olmadan da uçtan uca test edilebilir.
- **Sipariş / escrow akışı**: Ödeme → satıcı işe başlar → teslim eder → alıcı onaylar (ödeme serbest bırakılır) → değerlendirme bırakılır.
- **Panel**: Freelancer için ilan oluşturma ve gelen siparişler; alıcı için sipariş geçmişi.
- **Yapay freelancer üretimi**: Pazaryerini dolduran 1000 farklı freelancer profili (isim, meslek, yaş, şehir, uzmanlık ve çizilmiş profil fotoğrafı) tek komutla üretilir. Ayrıntı için [Yapay freelancer üretimi](#yapay-freelancer-üretimi).

## Teknoloji

- Next.js 16 (App Router, Server Actions, Turbopack)
- TypeScript, Tailwind CSS v4
- PostgreSQL + Prisma 7 (`@prisma/adapter-pg`)
- NextAuth v5 (Credentials provider, JWT session)
- iyzico (`iyzipay` resmi Node SDK, Checkout Form entegrasyonu)
- Zod (form/validasyon şemaları)

## Kurulum

```bash
npm install
```

### 1. Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın ve doldurun:

```bash
cp .env.example .env
```

- `DATABASE_URL`: PostgreSQL bağlantı adresi.
- `AUTH_SECRET`: NextAuth için rastgele bir gizli anahtar (`openssl rand -base64 32`).
- `IYZICO_API_KEY` / `IYZICO_SECRET_KEY`: iyzico sandbox anahtarlarınız. Boş bırakılırsa veya `sandbox-mock` olarak kalırsa uygulama **mock ödeme modunda** çalışır (gerçek kart bilgisi istemeden ödeme akışını simüle eder). Gerçek sandbox anahtarları [iyzico Merchant Panel](https://merchant.iyzipay.com)'den alınabilir.

### 2. Veritabanı

```bash
npm run db:setup   # şemayı kurar ve demo içeriği yükler
```

Bu komut migration'ları uygular ve ardından seed'i çalıştırır. Erken dönemdeki
altı migration demo içeriği doğrudan `INSERT` ile ekliyor ve henüz var olmayan
satırlara atıfta bulunduğu için boş bir veritabanında hata veriyor; aynı içeriği
seed zaten ürettiğinden bu betik onları çalıştırmadan uygulanmış sayıyor.
Dağıtımdaki veritabanları etkilenmez — orada bu migration'lar zaten uygulanmış
durumda.

Veriyi tazelemek için tek başına seed yeterli:

```bash
npm run db:seed
```

Seed, 1000 yapay freelancer profilini de yazar; sadece onları tazelemek için
`npm run freelancer:uret` yeterlidir (aşağıya bakın).

### 3. Geliştirme sunucusu

```bash
npm run dev
```

`http://localhost:3000` adresini açın.

### Demo hesaplar (seed sonrası)

| Rol | E-posta | Şifre |
| --- | --- | --- |
| Alıcı | `buyer@profestia.dev` | `password123` |
| Freelancer | `mert@profestia.dev` (veya diğer seed'lenen satıcılar) | `password123` |

## Yapay freelancer üretimi

Pazaryerinin dolu görünmesi için 1000 farklı freelancer profili üretilir. Her profilde
**isim, meslek, yaş, şehir, uzmanlık listesi ve profil fotoğrafı** bulunur.

```bash
npm run freelancer:uret                 # 1000 profili oluşturur, var olanları tazeler
npm run freelancer:uret -- --dry-run    # hiçbir şey yazmadan ne olacağını gösterir
npm run freelancer:uret -- --adet=50    # daha küçük bir set
npm run freelancer:uret -- --sql        # migration'a gömülecek SQL'i basar
```

Nasıl çalışıyor:

- **Üreteç** (`prisma/synthetic-freelancers.ts`) veritabanına dokunmaz; her profil kendi
  sırasından türetilir, yani üreteç ikinci kez çalıştığında aynı bin kişiyi üretir. 61
  meslek on kategoriye sırayla dağıtılır, isim/yaş/şehir/uzmanlık ise e-postanın
  hash'inden gelir. Şehirler ağırlıklı seçilir: kalabalık İstanbul'da toplanır, uzun
  kuyruk Yalova'ya kadar incelir.
- **Profil fotoğrafı** iki katmanlı. Varsayılan katman çizimdir
  (`src/lib/avatar-art.ts`): ten, saç, kıyafet, gözlük ve sakal tohumun hash'inden
  seçilir, `/api/avatar/[seed]` adresinden SVG olarak servis edilir; dış servise, API
  anahtarına ve profil başına depolamaya gerek yoktur. Üstüne, `PEXELS_API_KEY`
  tanımlıysa Pexels'ten **gerçek portre fotoğrafları** çekilebilir
  (`src/lib/profile-photos.ts`): API'de ülke filtresi yok, o yüzden yerellik tamamen
  aramanın kendisinden gelir — hepsi Türkiye'yi hedefler (`locale=tr-TR` ile Türkçe
  terimler, ardından Türkiye/İstanbul adı geçen İngilizce olanlar). Derinlik arama
  sayısından gelir, sayfa sayısından değil: bir aramanın beşinci sayfası artık sorulan
  şeye benzemez. Terimler çalışan profesyonel portresini hedefler, çünkü profillerin
  yaşı 22–58 ve stok sitelerde milliyet araması belgesel fotoğrafçılığa (yaşlı, kırsal
  kareler) çıkar. Son eleme Pexels'in fotoğraf açıklamasıyla (`alt`) yapılır: kalabalık,
  nesne, çocuk ya da "elderly/old" diye tanımlanan kareler hiçbir profile atanmaz ve
  açıklama profilin ismiyle aynı cinsiyeti söylemiyorsa fotoğraf kullanılmaz — eleme
  sonrası fotoğraf düşmeyen profil çizimle kalır. Arama profilin ismine göre kadın/erkek
  ayrılır,
  aynı fotoğraf iki profilde kullanılmaz, fotoğraf düşmeyen profil çizimle kalır. Çalıştırmak
  için admin panelinde **/admin/profil-fotograflari** ekranındaki düğme ya da:

  ```bash
  npm run profil:fotograf              # fotoğrafı olmayan profilleri doldur
  npm run profil:fotograf -- --force   # hepsini yeniden çek
  ```

  Fotoğraflar yalnızca `synthetic` işaretli profillere atanır — gerçek bir kullanıcıya
  hiçbir zaman başkasının fotoğrafı konmaz.
- **Yazma** (`prisma/sync-synthetic-freelancers.ts`) e-postaya göre eşleşir ve yalnızca
  `synthetic` işaretli satırları günceller. Aynı e-postaya sahip gerçek bir hesap varsa
  atlanır ve raporlanır — üretim tekrar çalıştığında gerçek bir kayıt ezilmez.
- Üretilen hesapların parolası bilerek kullanılamaz durumdadır (`!showcase-profile-no-login`);
  bunlar vitrin profilleridir, giriş yapılan hesaplar değil. Admin panelindeki kullanıcı
  listesi varsayılan olarak sadece gerçek hesapları gösterir.
- Profiller `/freelancerlar` sayfasında listelenir; meslek, şehir, uzmanlık ve isim
  üzerinden filtrelenebilir.
- Aynı çalıştırma, generatörden önce var olan 208 demo satıcıyı (isimli hesaplar ve
  `fl1…fl200`) da tamamlar: isimleri, meslekleri ve ilanları olduğu gibi kalır, eksik
  olan yaş/şehir/uzmanlık/fotoğraf doldurulur (`prisma/showcase-freelancers.ts`).
  Uzmanlıkları katalogdan değil **kendi ilanlarının alt kategorilerinden** gelir, yani
  profildeki etiketler altındaki ilanlarla aynı şeyi söyler.
- Çekilmiş gerçek fotoğraflar korunur: üreteci yeniden çalıştırmak profil metnini
  tazeler ama fotoğrafı çizime geri döndürmez.

## Proje yapısı

```
prisma/schema.prisma        Veritabanı şeması
prisma/seed.ts               Örnek veri
prisma/synthetic-freelancers.ts       1000 yapay freelancer üreteci (isim, meslek, yaş, şehir, uzmanlık)
prisma/showcase-freelancers.ts        Generatörden önceki demo satıcıların profilini tamamlar
prisma/sync-synthetic-freelancers.ts  Üretilen profilleri veritabanına yazar
scripts/generate-freelancers.ts       `npm run freelancer:uret` komutu
src/lib/avatar-art.ts                 Çizilen profil fotoğrafı
src/lib/profile-photos.ts             Pexels'ten gerçek portre fotoğrafı atama
scripts/fetch-profile-photos.ts       `npm run profil:fotograf` komutu
src/auth.ts                  NextAuth yapılandırması
src/lib/                     Prisma client, iyzico client, iş mantığı (orders, gigs, validation)
src/app/                     Next.js App Router sayfaları
  ├── giris, kayit           Kimlik doğrulama
  ├── kategoriler            Filtrelenebilir gig listesi
  ├── gig/[slug]              Gig detay + satın alma
  ├── freelancerlar           Freelancer dizini (meslek/şehir/uzmanlık filtreleri)
  ├── freelancer/[id]         Freelancer profili
  ├── api/avatar/[seed]       Çizilen profil fotoğrafı (SVG)
  ├── odeme/[orderId]         iyzico ödeme sayfası (gerçek/mock)
  ├── siparis/[orderId]       Sipariş durumu, escrow onayı, değerlendirme
  └── panel                  Freelancer / alıcı paneli
```

## Notlar

- Ödemeler iyzico Checkout Form akışını kullanır: `checkoutFormInitialize` ile başlatılır, kullanıcı kart bilgisini iyzico'nun barındırdığı formda girer, `callbackUrl` üzerinden dönen `token` ile `checkoutForm.retrieve` çağrılarak ödeme doğrulanır (`src/lib/iyzico.ts`, `src/app/api/payment/callback/route.ts`).
- Sipariş tutarı, iş onaylanana kadar satıcıya "aktarılmamış" kabul edilir (`Order.escrowReleased`); alıcı teslimatı onayladığında serbest bırakılır.
- Prisma Client bu projede özel bir dizine üretilir: `src/generated/prisma` (`.gitignore`'da hariç tutulmuştur, `prisma generate` ile yeniden oluşturulur).
