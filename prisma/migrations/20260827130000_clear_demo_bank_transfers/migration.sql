-- Havale/EFT Onayları ekranındaki demo/test kayıtlarını temizler.
--
-- Ekran PENDING_VERIFICATION durumundaki siparişleri listeler. Test sırasında oluşmuş
-- demo alıcı kayıtları (ör. "Demo Alıcı") burada görünüyordu; bir önceki migration ile
-- eklenen 293 gerçek-isimli kayıt (htx-imp-*) dışında bu durumdaki her sipariş siliniyor,
-- böylece ekranda yalnızca içe aktarılan gerçek isimler kalır.
--
-- Silme cascade: bağlı Payment satırı da gider (Payment.orderId onDelete Cascade). Yalnızca
-- onay bekleyen (PENDING_VERIFICATION) siparişler etkilenir; ödenmiş/tamamlanmış siparişlere
-- dokunulmaz.

DELETE FROM "orders"
WHERE "status" = 'PENDING_VERIFICATION'
  AND "id" NOT LIKE 'htx-imp-%';
