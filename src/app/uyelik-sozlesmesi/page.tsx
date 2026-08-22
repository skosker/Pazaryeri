import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Üyelik Sözleşmesi — Profestia" };

// 1-4. maddeler ve 5. maddenin başlığı henüz gelmedi; metin tamamlanınca aşağıya
// eklenecek ve LegalPage'teki draft işareti kaldırılacak.
export default function UyelikSozlesmesiPage() {
  return (
    <LegalPage title="Üyelik Sözleşmesi" draft>
      <h2>MADDE 5</h2>
      <p>5.1. Platform, yürürlükteki mevzuat ve özellikle 6493 sayılı Ödeme ve Menkul Kıymet Mutabakat Sistemleri, Ödeme Hizmetleri ve Elektronik Para Kuruluşları Hakkında Kanun’un ilgili hükümleri çerçevesinde, Platform üzerinden gerçekleştirilen hizmetlere ilişkin bedellerin tahsilat ve transfer süreçlerini, uygulanabilir olduğu ölçüde, gönderen veya Alıcı namına mal veya hizmet pazarlığına ya da alım satımına yetkili olan ticari temsilci sıfatıyla gerçekleştirebilir.</p>
      <p>5.2. Bu kapsamda Hizmet Sağlayıcı, Platform üzerinden gerçekleştireceği hizmetlere ilişkin bedellerin kendi adına ve hesabına tahsil edilmesi konusunda Platform’u, yürürlükteki mevzuatın izin verdiği kapsam ve süre boyunca yetkilendirdiğini kabul ve taahhüt eder.</p>
      <p>5.3. Alıcı tarafından hizmet bedelinin Platform üzerinden ödenmesi, mevzuat ve ilgili işlem koşulları çerçevesinde, Alıcı’nın Hizmet Sağlayıcıya karşı ödeme yükümlülüğünün ifası hükmündedir.</p>
      <p>5.4. Platform; hizmet bedellerinden Platform kullanım bedeli, komisyon, işlem bedeli, iade, chargeback, yasal kesintiler ve Hizmet Sağlayıcıdan tahsil edilmesi gereken diğer tutarları, ilgili mevzuata ve işlem koşullarına uygun şekilde mahsup edebilir.</p>
      <p>5.5. Hizmet Sağlayıcıya yapılacak ödemelerin zamanı, yöntemi, bekletilmesi veya bloke edilmesi; işlem güvenliği, iade/itiraz süreçleri, chargeback, dolandırıcılık şüphesi, mevzuat veya yetkili kurum talepleri nedeniyle Platform tarafından geçici olarak sınırlandırılabilir.</p>
      <h2>MADDE 6 – PLATFORM KOMİSYONU VE ÜCRETLER</h2>
      <p>Platform, gerçekleştirilen işlemler üzerinden Kullanıcı’ya işlem öncesinde bildirilen oran veya tutarda komisyon ve/veya hizmet bedeli tahsil edebilir.</p>
      <p>Komisyon ve ücretlerde yapılacak değişiklikler, değişikliğin yürürlüğe girmesinden önce Kullanıcı’ya uygun yöntemlerle bildirilebilir.</p>
      <h2>MADDE 7 – SİPARİŞ, HİZMETİN İFASI VE ONAY</h2>
      <p>Hizmetin kapsamı, bedeli, teslim/ifa süresi ve diğer koşullar sipariş veya işlem sırasında Platform üzerinde gösterilir.</p>
      <p>Hizmet Sağlayıcı, üstlendiği işi kararlaştırılan kapsam ve sürede gereği gibi yerine getirmekle yükümlüdür.</p>
      <p>Platform, işlem güvenliği ve uyuşmazlıkların yönetimi amacıyla ödeme, teslim, onay ve itiraz süreçlerini belirleyebilir.</p>
      <h2>MADDE 8 – KULLANICI DAVRANIŞLARI VE PLATFORM DIŞI İŞLEM YASAĞI</h2>
      <p>Kullanıcı; Platform’u hukuka, işbu Sözleşme’ye ve Platform kurallarına uygun kullanmakla yükümlüdür.</p>
      <p>Kullanıcı;</p>
      <ul>
        <li>sahte veya yanıltıcı bilgi veremez,</li>
        <li>başkasının hesabını kullanamaz,</li>
        <li>Platform’un güvenliğini veya teknik altyapısını ihlal edemez,</li>
        <li>spam, kötü amaçlı yazılım veya otomatik veri toplama araçları kullanamaz,</li>
        <li>diğer Kullanıcıların kişisel verilerini izinsiz toplayamaz,</li>
        <li>Platform üzerinden tanıştığı Kullanıcıları Platform dışına yönlendirerek işlemi Platform dışında gerçekleştiremez.</li>
      </ul>
      <p>Platform dışına yönlendirme veya ödeme sisteminin bertaraf edilmesine yönelik davranışlar, ağır sözleşme ihlali olarak kabul edilir.</p>
      <h2>MADDE 9 – İÇERİK VE FİKRİ MÜLKİYET</h2>
      <p>Kullanıcı tarafından Platform’a yüklenen profil, portföy, görsel, metin, video, tasarım ve diğer içeriklerin hukuka uygunluğundan Kullanıcı sorumludur.</p>
      <p>Kullanıcı, Platform’a yüklediği içeriklerin Platform üzerinde hizmetin sunulması, tanıtılması ve kullanıcı deneyiminin geliştirilmesi amacıyla kullanılmasına, gösterilmesine ve teknik olarak çoğaltılmasına, gerekli olduğu ölçüde lisans verir.</p>
      <p>Platform’un marka, yazılım, tasarım, alan adı, arayüz ve diğer fikri mülkiyet hakları Platform’a aittir.</p>
      <h2>MADDE 10 – KİŞİSEL VERİLER VE GİZLİLİK</h2>
      <p>Kullanıcı’ya ait kişisel veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu, ilgili ikincil mevzuat ve Platform’un KVKK/Gizlilik Politikası kapsamında işlenir.</p>
      <p>Kullanıcı, Platform üzerinde kendisine sunulan diğer Kullanıcılara ait kişisel verileri yalnızca hizmetin gerçekleştirilmesi amacıyla kullanacağını ve hukuka aykırı şekilde işlemeyeceğini kabul eder.</p>
      <h2>MADDE 11 – HESABIN KISITLANMASI, FESİH VE SORUMLULUK</h2>
      <p>Platform; Kullanıcı’nın Sözleşme’ye, mevzuata veya Platform kurallarına aykırı davranması, dolandırıcılık veya kötüye kullanım şüphesi bulunması, ödeme güvenliği açısından risk oluşması veya yetkili makamların talepte bulunması halinde hesabı geçici olarak kısıtlayabilir, askıya alabilir veya Sözleşme’yi feshedebilir.</p>
      <p>Kullanıcı, kendi eylemleri nedeniyle Platform’un veya üçüncü kişilerin uğradığı doğrudan zararları, yürürlükteki mevzuatın izin verdiği ölçüde karşılamakla yükümlüdür.</p>
      <p>Platform’un sorumluluğu, emredici mevzuat hükümleri saklı kalmak üzere, kendi kusurundan kaynaklanan doğrudan zararlarla sınırlıdır.</p>
      <h2>MADDE 12 – YÜRÜRLÜK, DEĞİŞİKLİK VE UYUŞMAZLIKLAR</h2>
      <p>Platform, yürürlükteki mevzuata aykırı olmamak kaydıyla Sözleşme ve Platform kurallarında değişiklik yapabilir. Değişiklikler Platform üzerinden ilan edilir ve gerekli hallerde Kullanıcı’ya ayrıca bildirilir.</p>
      <p>Sözleşme’nin herhangi bir hükmünün geçersiz olması diğer hükümlerin geçerliliğini etkilemez.</p>
      <p>İşbu Sözleşme, Kullanıcı’nın elektronik ortamda onaylamasıyla yürürlüğe girer.</p>
      <p>Sözleşme’den doğan uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri, yürürlükteki emredici yetki kuralları saklı kalmak kaydıyla yetkilidir.</p>
    </LegalPage>
  );
}
