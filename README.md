# Profestia

"İşini bilen freelancer'larla projeni hayata geçir" — Türkçe bir hizmet pazaryeri (Fiverr benzeri) uygulaması. Next.js (App Router), PostgreSQL/Prisma, NextAuth ve iyzico ödeme altyapısı ile inşa edilmiş gerçek bir web uygulamasıdır.

## Özellikler

- **Kayıt / Giriş**: E-posta + şifre ile kimlik doğrulama (NextAuth v5, bcrypt ile hashlenmiş şifreler), Alıcı / Freelancer rol seçimi.
- **Veritabanı**: PostgreSQL üzerinde Prisma ORM ile ilişkisel şema (User, Category, Gig, Package, Order, Payment, Review).
- **Gig listeleme**: Kategori, bütçe ve teslim süresi filtreleriyle hizmet arama; gig detay sayfası ve paket satın alma akışı.
- **Ödeme altyapısı**: iyzico Checkout Form entegrasyonu (gerçek API anahtarları tanımlandığında canlı çalışır). Anahtar tanımlı değilse otomatik olarak **mock ödeme modunda** çalışır, böylece iyzico hesabı olmadan da uçtan uca test edilebilir.
- **Sipariş / escrow akışı**: Ödeme → satıcı işe başlar → teslim eder → alıcı onaylar (ödeme serbest bırakılır) → değerlendirme bırakılır.
- **Panel**: Freelancer için ilan oluşturma ve gelen siparişler; alıcı için sipariş geçmişi.

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

## Proje yapısı

```
prisma/schema.prisma        Veritabanı şeması
prisma/seed.ts               Örnek veri
src/auth.ts                  NextAuth yapılandırması
src/lib/                     Prisma client, iyzico client, iş mantığı (orders, gigs, validation)
src/app/                     Next.js App Router sayfaları
  ├── giris, kayit           Kimlik doğrulama
  ├── kategoriler            Filtrelenebilir gig listesi
  ├── gig/[slug]              Gig detay + satın alma
  ├── odeme/[orderId]         iyzico ödeme sayfası (gerçek/mock)
  ├── siparis/[orderId]       Sipariş durumu, escrow onayı, değerlendirme
  └── panel                  Freelancer / alıcı paneli
```

## Notlar

- Ödemeler iyzico Checkout Form akışını kullanır: `checkoutFormInitialize` ile başlatılır, kullanıcı kart bilgisini iyzico'nun barındırdığı formda girer, `callbackUrl` üzerinden dönen `token` ile `checkoutForm.retrieve` çağrılarak ödeme doğrulanır (`src/lib/iyzico.ts`, `src/app/api/payment/callback/route.ts`).
- Sipariş tutarı, iş onaylanana kadar satıcıya "aktarılmamış" kabul edilir (`Order.escrowReleased`); alıcı teslimatı onayladığında serbest bırakılır.
- Prisma Client bu projede özel bir dizine üretilir: `src/generated/prisma` (`.gitignore`'da hariç tutulmuştur, `prisma generate` ile yeniden oluşturulur).
