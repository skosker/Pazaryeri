# Yapılacaklar

Yayına alınırken açık kalan işler. Biri tamamlandıkça buradan silinsin.

Son güncelleme: 22 Ağustos 2026

## Yayın öncesi kapatılması gerekenler

- [ ] **Posta kutusunu test et.** Natro paketi tek hesaba izin verdiği için gerçek
      kutu `info@prosinta.com`; `destek@` ve `admin@` onun takma adları olarak
      tanımlandı. Sitede "şifremi unuttum" akışını `admin@prosinta.com` ile
      çalıştır — mail `info@` kutusuna düşerse hem takma ad hem sıfırlama zinciri
      doğrulanmış olur.

## Yayın sonrası

- [ ] **İlan kapak fotoğrafları:** `/admin/kapaklar` → "Eksik kapakları doldur".
      Basılmadığı sürece kapaklar çizimli görünüyor.

- [ ] **KEP adresi**, hesap açılırsa KVKK künyesine eklenmeli.

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
