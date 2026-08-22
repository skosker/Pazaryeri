import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Üyelik Sözleşmesi — Prosinta" };

// Metinde [ŞİRKET UNVANI] ve [PLATFORM ADI] yer tutucuları, alt bardaki unvanla aynı
// olacak şekilde "Prosinta Bilgi Teknolojileri Paz. ve Tic. A.Ş." ve "Prosinta" ile
// dolduruldu; unvan farklıysa buradan düzeltilir.
export default function UyelikSozlesmesiPage() {
  return (
    <LegalPage title="Üyelik Sözleşmesi">
      <p>İşbu Kullanıcı Sözleşmesi (“Sözleşme”), Prosinta Bilgi Teknolojileri Paz. ve Tic. A.Ş. (“Şirket”) tarafından işletilen Prosinta internet sitesi, mobil uygulamaları ve bunlara bağlı dijital hizmetlerden (“Platform”) yararlanan gerçek veya tüzel kişiler (“Kullanıcı”) arasında elektronik ortamda kurulmuştur.</p>
      <p>Platform’a üye olan veya Platform üzerinden herhangi bir hizmet kullanan Kullanıcı, işbu Sözleşme’yi okuduğunu, anladığını ve kabul ettiğini beyan eder.</p>
      <h2>MADDE 1 – TARAFLAR VE TANIMLAR</h2>
      <p>1.1. Platform: Şirket tarafından işletilen, hizmet sunan profesyoneller ile bu hizmetlere ihtiyaç duyan kişi ve işletmeleri dijital ortamda bir araya getiren çevrimiçi platformdur.</p>
      <p>1.2. Kullanıcı: Platform’a üye olan gerçek veya tüzel kişidir.</p>
      <p>1.3. Alıcı: Platform üzerinden bir hizmet satın alan Kullanıcıdır.</p>
      <p>1.4. Hizmet Sağlayıcı: Platform üzerinden hizmet sunan, ilan yayınlayan veya proje kabul eden Kullanıcıdır.</p>
      <p>1.5. Sipariş/Proje: Alıcı ile Hizmet Sağlayıcı arasında Platform üzerinden oluşturulan hizmet ilişkisidir.</p>
      <h2>MADDE 2 – PLATFORMUN KAPSAMI VE HUKUKİ NİTELİĞİ</h2>
      <p>2.1. Platform, Alıcılar ile Hizmet Sağlayıcıları bir araya getiren bir aracı hizmet sağlayıcı ve çevrimiçi hizmet pazaryeri olarak faaliyet gösterir.</p>
      <p>2.2. Şirket, aksi açıkça belirtilmedikçe Hizmet Sağlayıcı tarafından sunulan hizmetin tarafı, üreticisi, işvereni veya sağlayıcısı değildir.</p>
      <p>2.3. Hizmetin niteliği, kapsamı, teslimi, hukuka uygunluğu, fikri mülkiyet durumu ve hizmete ilişkin yükümlülükler esas olarak Hizmet Sağlayıcıya aittir.</p>
      <p>2.4. Şirket; Platform’un güvenli, erişilebilir ve etkin şekilde işletilmesi, kullanıcıların bir araya getirilmesi, sipariş ve ödeme süreçlerinin Platform üzerinden yürütülmesi ve uyuşmazlıkların çözümüne platform kuralları çerçevesinde destek olunması amacıyla hizmet sunar.</p>
      <h2>MADDE 3 – ÜYELİK VE HESAP</h2>
      <p>3.1. Kullanıcı, üyelik sırasında verdiği bilgilerin doğru, güncel ve kendisine ait olduğunu kabul eder.</p>
      <p>3.2. Şirket, gerekli gördüğü durumlarda Kullanıcı’dan kimlik, iletişim, vergi, şirket, banka hesabı veya diğer doğrulayıcı bilgi ve belgeleri talep edebilir.</p>
      <p>3.3. Kullanıcı hesabının güvenliği Kullanıcı’nın sorumluluğundadır. Kullanıcı hesabı üzerinden gerçekleştirilen işlemler, aksi ispat edilmedikçe Kullanıcı tarafından gerçekleştirilmiş kabul edilir.</p>
      <p>3.4. Tüzel kişi adına işlem yapan gerçek kişi, ilgili tüzel kişiyi temsil ve ilzama yetkili olduğunu kabul ve taahhüt eder.</p>
      <h2>MADDE 4 – HİZMET SAĞLAYICININ YÜKÜMLÜLÜKLERİ</h2>
      <p>4.1. Hizmet Sağlayıcı; sunduğu hizmetlerin hukuka, Platform kurallarına ve ilanında belirttiği şartlara uygun olmasından sorumludur.</p>
      <p>4.2. Hizmet Sağlayıcı, sunduğu hizmet ve içerikler üzerinde gerekli hak ve yetkilere sahip olduğunu ve üçüncü kişilerin fikri mülkiyet, kişilik ve sair haklarını ihlal etmediğini kabul eder.</p>
      <p>4.3. Hizmet Sağlayıcı, hizmeti zamanında, eksiksiz ve ilanında veya Sipariş’te belirtilen niteliklere uygun şekilde sunmakla yükümlüdür.</p>
      <p>4.4. Alıcıya ait bilgi, belge, proje dosyası, ticari sır ve diğer gizli bilgilerin korunmasından Hizmet Sağlayıcı sorumludur.</p>
      <h2>MADDE 5 – ALICININ YÜKÜMLÜLÜKLERİ</h2>
      <p>5.1. Alıcı, sipariş sırasında doğru ve yeterli bilgi sağlamak ve Hizmet Sağlayıcı ile Platform üzerinden yürütülen iş birliğinde dürüstlük ve iyi niyet kurallarına uygun hareket etmekle yükümlüdür.</p>
      <p>5.2. Alıcı, hizmet bedelini Platform tarafından belirlenen yöntemlerle ve süresinde öder.</p>
      <p>5.3. Alıcı, Hizmet Sağlayıcı tarafından teslim edilen işi makul süre içerisinde incelemek ve varsa itirazlarını Platform üzerinden bildirmekle yükümlüdür.</p>
      <h2>MADDE 6 – ÖDEME, TAHSİLAT VE TEMSİL YETKİSİ</h2>
      <p>6.1. Platform üzerinden gerçekleştirilen hizmetlere ilişkin bedeller, Platform’un sunduğu ödeme altyapısı ve ilgili mevzuata uygun ödeme hizmetleri çerçevesinde tahsil edilir.</p>
      <p>6.2. Şirket, 6493 sayılı Ödeme ve Menkul Kıymet Mutabakat Sistemleri, Ödeme Hizmetleri ve Elektronik Para Kuruluşları Hakkında Kanun’un 12/2-(b) maddesi kapsamında, ilgili mevzuatın izin verdiği ölçüde, Platform üzerinden gerçekleştirilen hizmetlere ilişkin bedellerin tahsilat ve transfer süreçlerini, gönderen veya Alıcı namına mal veya hizmet pazarlığına ya da alım satımına yetkili ticari temsilci sıfatıyla yürütür.</p>
      <p>6.3. Hizmet Sağlayıcı, Platform üzerinden gerçekleştirdiği satışlara ilişkin bedellerin kendi adına ve hesabına Alıcı’dan tahsil edilmesi, tahsil edilen tutarların ilgili işlem kapsamında kendisine aktarılması ve bu süreçlerin Platform tarafından yürütülmesi konusunda Şirket’i, ilgili mevzuatın izin verdiği kapsam ve süre boyunca, yetkilendirir.</p>
      <p>6.4. Alıcı, Platform üzerinden yaptığı ödemenin, Hizmet Sağlayıcı’ya olan ödeme yükümlülüğünü yerine getirdiğini kabul eder.</p>
      <p>6.5. Şirket, hizmet bedelinden Platform komisyonu, ödeme kuruluşu/banka masrafları, iade tutarları, yasal kesintiler ve Kullanıcı’nın Platform’a olan borçlarını ilgili mevzuata ve Platform kurallarına uygun şekilde mahsup edebilir.</p>
      <p>6.6. Şirket, şüpheli işlem, dolandırıcılık, chargeback, hukuki uyuşmazlık, resmi makam talebi veya mevzuattan kaynaklanan nedenlerle ilgili tutarı geçici olarak bloke edebilir veya aktarımı erteleyebilir.</p>
      <h2>MADDE 7 – PLATFORM DIŞI İŞLEM YASAĞI</h2>
      <p>7.1. Kullanıcılar, Platform üzerinden tanıştıkları kişi veya işletmelerle gerçekleştirilen hizmet ve ödeme ilişkilerini Platform dışına taşımamayı kabul eder.</p>
      <p>7.2. Platform üzerinden elde edilen iletişim bilgilerinin kullanılması suretiyle Platform komisyonunu veya ödeme sistemini bertaraf etmeye yönelik işlem yapılması yasaktır.</p>
      <p>7.3. Bu hükmün ihlali halinde Şirket; hesabı askıya alma, siparişi iptal etme, ödeme aktarımını durdurma, üyeliği sona erdirme ve doğan zararlarını talep etme haklarına sahiptir.</p>
      <h2>MADDE 8 – İÇERİK VE FİKRİ MÜLKİYET</h2>
      <p>8.1. Kullanıcı tarafından Platform’a yüklenen ilan, görsel, video, metin, portföy ve diğer içeriklerin hukuki sorumluluğu Kullanıcı’ya aittir.</p>
      <p>8.2. Kullanıcı, Platform’a yüklediği içerikler üzerinde gerekli haklara sahip olduğunu kabul eder.</p>
      <p>8.3. Kullanıcı, Platform’un işletilmesi, hizmetlerin sunulması, içeriklerin gösterilmesi ve Platform’un tanıtılması amacıyla yüklediği içerikler üzerinde Şirket’e, amaçla sınırlı ve makul süreyle, ücretsiz kullanım izni verir.</p>
      <p>8.4. Şirket, üçüncü kişilerin haklarını ihlal ettiği değerlendirilen içerikleri kaldırabilir veya erişime kapatabilir.</p>
      <h2>MADDE 9 – YASAKLI KULLANIMLAR</h2>
      <p>Kullanıcı;</p>
      <ul>
        <li>hukuka aykırı veya yasaklanmış hizmetler sunamaz,</li>
        <li>sahte veya yanıltıcı bilgi veremez,</li>
        <li>başka bir kişinin hesabını kullanamaz,</li>
        <li>Platform’un teknik altyapısına zarar veremez,</li>
        <li>otomatik veri toplama, scraping veya benzeri yöntemlerle Platform verilerini izinsiz toplayamaz,</li>
        <li>sahte sipariş, sahte yorum veya puanlama oluşturamaz,</li>
        <li>diğer Kullanıcıları Platform dışı işlem yapmaya yönlendiremez,</li>
        <li>Platform’u dolandırıcılık, kara para aklama veya başka bir hukuka aykırı amaçla kullanamaz.</li>
      </ul>
      <p>Şirket, bu fiillerin tespiti halinde hesabı derhal askıya alabilir veya kapatabilir.</p>
      <h2>MADDE 10 – GİZLİLİK VE KİŞİSEL VERİLER</h2>
      <p>10.1. Kullanıcı’ya ait kişisel veriler, 6698 sayılı KVKK ve ilgili mevzuata uygun olarak işlenir.</p>
      <p>10.2. Kişisel verilerin işlenmesine ilişkin ayrıntılar, Platform’un KVKK Aydınlatma Metni, Gizlilik Politikası ve Çerez Politikası kapsamında ayrıca düzenlenir.</p>
      <p>10.3. Kullanıcı, Platform üzerinde elde ettiği diğer Kullanıcılara ait kişisel verileri hukuka aykırı şekilde toplayamaz, kullanamaz veya üçüncü kişilere aktaramaz.</p>
      <h2>MADDE 11 – SORUMLULUK, SÜRE VE FESİH</h2>
      <p>11.1. Şirket, Platform’un kesintisiz veya hatasız çalışacağını garanti etmez; ancak hizmetin sürdürülebilirliği ve güvenliği için makul teknik ve idari tedbirleri alır.</p>
      <p>11.2. Hizmet Sağlayıcı ile Alıcı arasındaki hizmetin niteliği, teslimi, kalitesi ve hukuka uygunluğundan, ilgili mevzuatın emredici hükümleri saklı kalmak kaydıyla, esas olarak taraflar sorumludur.</p>
      <p>11.3. Şirket, Sözleşme’ye veya mevzuata aykırılık halinde Kullanıcı’nın hesabını geçici veya kalıcı olarak askıya alabilir, içerikleri kaldırabilir ve Sözleşme’yi feshedebilir.</p>
      <p>11.4. Kullanıcı’nın Sözleşme’ye aykırı davranışı nedeniyle Şirket’in uğradığı zarar, masraf, tazminat, idari yaptırım ve benzeri mali yükümlülükler bakımından Kullanıcı’nın sorumluluğu saklıdır.</p>
      <h2>MADDE 12 – YÜRÜRLÜK, DEĞİŞİKLİK VE UYUŞMAZLIKLAR</h2>
      <p>12.1. Şirket, yürürlükteki mevzuata aykırı olmamak kaydıyla Sözleşme’yi ve Platform kurallarını güncelleyebilir. Değişiklikler Platform üzerinden yayımlandığı tarihte veya belirtilen yürürlük tarihinde geçerli olur.</p>
      <p>12.2. Sözleşme’nin herhangi bir hükmünün geçersiz olması, diğer hükümlerin geçerliliğini etkilemez.</p>
      <p>12.3. Kullanıcı’nın hesabını kapatması, sona erme tarihinden önce doğmuş hak ve yükümlülükleri ortadan kaldırmaz.</p>
      <p>12.4. İşbu Sözleşme’den doğan uyuşmazlıklarda, tüketici mevzuatından doğan zorunlu yetki hükümleri saklı kalmak kaydıyla, İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</p>
      <p>12.5. Kullanıcı, Platform’a elektronik ortamda “Okudum, kabul ediyorum” şeklinde onay vermesiyle işbu Sözleşme’yi elektronik ortamda akdetmiş ve hükümlerini kabul etmiş olur.</p>
    </LegalPage>
  );
}
