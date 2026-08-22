-- Çekilmiş portrelerin çerçevesini düzeltir.
--
-- Fotoğraflar CDN'den kare olarak isteniyordu (fit=crop&w=400&h=400). CDN kırpmayı
-- ortadan yapıyor ve yüzün nerede olduğunu bilmiyor; boy fotoğrafı olan karelerde
-- yuvarlak avatara yüz yerine gövde düşüyordu. Artık portrenin tamamı alınıyor ve
-- kırpma arayüzde üste yakın yapılıyor (UserAvatar).
--
-- Var olan satırlarda sadece adresin kırpma parametreleri değişiyor; fotoğrafın
-- kendisi aynı kalıyor, yeniden çekmeye gerek yok.

UPDATE "users"
SET "image" = replace("image", '&fit=crop&w=400&h=400', '&w=400'),
    "updatedAt" = now()
WHERE "synthetic"
  AND "image" LIKE 'https://images.pexels.com/%'
  AND "image" LIKE '%fit=crop&w=400&h=400%';
