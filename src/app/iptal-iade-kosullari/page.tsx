import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Sipariş İptal ve İade Koşulları" };

export default function IptalIadeKosullariPage() {
  return (
    <LegalPage title="Sipariş İptal ve İade Koşulları">
      <h2>1. GENEL İLKELER</h2>
      <p>Prosinta Dijital Teknolojiler A.Ş. (“Platform”), 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında Aracı Hizmet Sağlayıcı olarak faaliyet göstermektedir. Bir siparişin konusu olan hizmet, Platform tarafından değil, ilgili freelancer tarafından ifa edilir; bu nedenle iptal ve iade talepleri öncelikle Alıcı ile Satıcı arasındaki ilişki çerçevesinde değerlendirilir.</p>
      <p>Platform, mevzuattan doğan yükümlülükleri saklı kalmak kaydıyla, taraflar arasındaki iptal ve iade süreçlerinde <strong>destek@prosinta.com</strong> üzerinden teknik ve idari destek sağlar.</p>

      <h2>2. CAYMA HAKKI</h2>
      <p>Mesafeli Sözleşmeler Yönetmeliği’nin 15 inci maddesi uyarınca, hizmetin ifasına Alıcı’nın onayıyla başlanmış olması hâlinde, ifası başlamış hizmetler bakımından cayma hakkı kullanılamaz.</p>
      <p>Buna göre; bir sipariş “Devam Ediyor” durumuna geçtikten, yani ilgili freelancer işe fiilen başladıktan sonra, Alıcı’nın tek taraflı olarak ücretsiz iptal hakkı bulunmamaktadır. Bu aşamadan sonraki iptal talepleri, aşağıdaki 4 üncü maddede açıklandığı şekilde Satıcı’nın onayına ve tarafların mutabakatına tabidir.</p>

      <h2>3. SİPARİŞ DURUMUNA GÖRE İPTAL</h2>
      <p>Bir siparişin iptal edilebilirliği, o an bulunduğu duruma göre değişir:</p>
      <ul>
        <li><strong>Ödeme Bekleniyor / Ödeme Onayı Bekleniyor:</strong> Ödeme henüz tamamlanmadığı veya doğrulanmadığı için Alıcı, siparişten herhangi bir kesinti olmaksızın vazgeçebilir.</li>
        <li><strong>Ödendi:</strong> Ödeme alınmış ancak Satıcı işe henüz başlamamışsa, Alıcı iptal talebini destek@prosinta.com üzerinden iletebilir; bu aşamadaki talepler genel kural olarak tam iade ile sonuçlanır.</li>
        <li><strong>Devam Ediyor:</strong> Satıcı işe başladıktan sonraki iptaller, 2 nci maddede açıklanan cayma hakkı istisnası kapsamındadır; iade tutarı, o ana kadar tamamlanan iş bakımından taraflar arasında mutabakatla belirlenir.</li>
        <li><strong>Teslim Edildi:</strong> Teslim edilen işin sözleşmeye veya sipariş kapsamına uygun olmadığı durumlarda Alıcı, teslim üzerinden itirazını bildirebilir; itiraz haklı bulunursa revizyon, kısmi iade veya tam iade yollarından biri uygulanabilir.</li>
        <li><strong>Tamamlandı:</strong> Sipariş Alıcı tarafından onaylanıp tamamlandıktan sonra, iade talepleri yalnızca Satıcı’nın kabulüyle veya Platform’un 5 inci maddede açıklanan itiraz süreciyle değerlendirilir.</li>
        <li><strong>İptal Edildi:</strong> İptal edilmiş bir sipariş için tahsil edilmiş bir bedel varsa, ilgili tutar 6 ncı maddedeki süreçle iade edilir.</li>
      </ul>

      <h2>4. SATICI TARAFINDAN İPTAL</h2>
      <p>Satıcı, kendisine ulaşan bir siparişi henüz teslim aşamasına gelmeden iptal edebilir. Satıcı kaynaklı iptallerde Alıcı’dan tahsil edilmiş bedel, kesinti yapılmaksızın Alıcı’ya iade edilir.</p>

      <h2>5. İADE TALEPLERİNİN BİLDİRİLMESİ</h2>
      <p>İptal veya iade talepleri, sipariş numarası belirtilerek destek@prosinta.com adresine iletilir. Talepler, Alıcı ve Satıcı arasındaki yazışma geçmişi ve teslim kayıtları incelenerek değerlendirilir.</p>
      <p>Platform, mevzuat kapsamında kendisine yüklenen yükümlülükler saklı kalmak kaydıyla, uyuşmazlığın çözümünde bağlayıcı bir hakem değil, teknik ve idari destek sağlayan bir aracı konumundadır.</p>

      <h2>6. İADE YÖNTEMİ VE SÜRESİ</h2>
      <p>İade edilecek tutar, ödemenin yapıldığı yönteme göre işleme alınır:</p>
      <ul>
        <li><strong>Kredi/Banka Kartı:</strong> İyzico altyapısı üzerinden alınan ödemeler, aynı kart hesabına iade edilir. İadenin karta yansıma süresi, ilgili bankanın işlem sürelerine bağlı olarak değişebilir.</li>
        <li><strong>Havale/EFT:</strong> Havale/EFT ile yapılan ödemelerde iade, Alıcı’nın bildirdiği IBAN’a Platform tarafından manuel olarak gönderilir.</li>
      </ul>
      <p>İade onaylandıktan sonra işlemin başlatılması makul süre içinde gerçekleştirilir; kartla yapılan ödemelerde nihai süre bankadan bankaya farklılık gösterebilir.</p>

      <h2>7. YÜRÜRLÜK</h2>
      <p>Platform, işbu koşulları mevzuata uygun olmak kaydıyla her zaman değiştirme, güncelleme veya yenileme hakkını saklı tutar. Güncellenen hükümler Platform’da yayımlandığı tarihte yürürlüğe girer.</p>

      <h2>Künye</h2>
      <ul>
        <li>Prosinta Dijital Teknolojiler A.Ş.</li>
        <li>Adres: Levent Mah. Karanfil Sk. No: 13, Beşiktaş / İstanbul</li>
        <li>Ticaret Sicil No: 1155314</li>
        <li>Vergi Dairesi: Beşiktaş</li>
        <li>Vergi No: 7331421416</li>
        <li>E-posta: destek@prosinta.com</li>
      </ul>
    </LegalPage>
  );
}
