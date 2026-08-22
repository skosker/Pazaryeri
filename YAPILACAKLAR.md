# Yapılacaklar

Yayına alınırken açık kalan işler. Biri tamamlandıkça buradan silinsin.

Son güncelleme: 22 Ağustos 2026

## Yayın öncesi kapatılması gerekenler

- [ ] **`AUTH_SECRET` gerçek bir değer mi?** Vercel → Environment Variables.
      Değer `replace-with-a-random-32-byte-secret` ise acil: bu metin depoda
      herkese açık duruyor, bilen biri kendine ADMIN rolü yazan bir oturum
      çerezi üretip panele girebilir. Yeni değer üretmek için tarayıcı
      konsolunda (F12):
      `crypto.getRandomValues(new Uint8Array(32)).reduce((s,b)=>s+b.toString(16).padStart(2,'0'),'')`
      Değiştirince mevcut bütün oturumlar düşer.

- [ ] **`destek@prosinta.com` posta kutusunu aç** (Natro → Kurumsal E-Posta).
      Bu adres Kullanım Şartları ve KVKK metninde yayımlandı; kutu yoksa gelen
      başvurular kayboluyor. KVKK başvuru kanalı olarak da bu adres gösterildi.

- [ ] **`admin@prosinta.com` posta kutusunu aç.** Admin hesabının giriş adresi
      bu; kutu yoksa şifre sıfırlama maili hiçbir yere ulaşmaz ve şifre
      unutulursa tek çare Neon'un SQL editöründen elle müdahale olur.

- [ ] **Vergi numarasını doğrula.** Künyede `731421416` yazıyor — dokuz hane.
      Türkiye'de vergi kimlik numarası on hanelidir, bir hane eksik görünüyor.

## Yayın sonrası

- [ ] **İlan kapak fotoğrafları:** `/admin/kapaklar` → "Eksik kapakları doldur".
      Basılmadığı sürece kapaklar çizimli görünüyor.

- [ ] **Künyede kalan alan:** Yürürlük Tarihi (`[●]`).
      KEP adresi, hesap açılırsa KVKK künyesine eklenmeli.

- [ ] **DMARC'ı sıkılaştır.** Bir hafta gönderim geçtikten sonra Natro'daki
      `_dmarc` TXT kaydını `v=DMARC1; p=quarantine; rua=mailto:destek@prosinta.com`
      yap. Şu an `p=none`, yani yalnızca izliyor.

- [ ] **`www.prosinta.com`** Vercel'de yeşile döndü mü, Domains ekranından
      kontrol et.

- [ ] **`prosinta.com.tr`** henüz bağlanmadı. Vercel → Domains → Add Existing,
      eklerken "Redirect to Another Domain" → `prosinta.com`, tip 308 Permanent.
      Sonra Natro'da o alan adının DNS'inde de A kaydını `76.76.21.21` yap.

## Karar bekleyenler

- [ ] **iyzico gerçek anahtarlar.** Şu an mock modda: kart ödemesi gerçek
      değil, havale/EFT çalışıyor.

- [ ] **Komisyon oranı.** Hakediş kaydı `gross`/`commission`/`net` alanlarıyla
      hazır ama komisyon 0 yazılıyor. Oran belirlenince
      `src/lib/order-actions.ts` içindeki `buyerCompleteOrder` güncellenecek.

- [ ] **Ödeme modeli için mali müşavir görüşü.** Paranın platform üzerinden
      geçip satıcıya aktarılması, aracılık ve fatura düzeni bakımından
      danışılması gereken bir konu.
