import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Kişisel Verilerin Korunması Politikası" };

// 11. maddedeki başvuru kanalı ile künyedeki adres, e-posta ve KEP adresi henüz
// verilmedi. KVKK başvuru hakkının kullanılabilmesi için bu kanalın yayımlanması
// gerektiğinden sayfa, bunlar doldurulana kadar taslak işaretiyle duruyor.
export default function GizlilikPolitikasiPage() {
  return (
    <LegalPage title="Kişisel Verilerin Korunması Politikası ve Aydınlatma Metni" draft>
      <h2>1. Veri Sorumlusu</h2>
      <p>İşbu metin, Prosinta platformunu işleten Prosinta Bilgi Teknolojileri Paz. ve Tic. A.Ş. (“Prosinta”) tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında hazırlanmıştır.</p>
      <h2>2. İşlenen Kişisel Veriler</h2>
      <p>Üyelik ve platform kullanımı kapsamında; kimlik, iletişim, adres, hesap ve işlem bilgileri, ödeme bilgileri, profil bilgileri, mesajlaşma içerikleri, IP adresi, cihaz ve işlem kayıtları ile mevzuatın izin verdiği diğer veriler işlenebilir.</p>
      <h2>3. İşleme Amaçları</h2>
      <p>Kişisel veriler; üyelik ve hesap yönetimi, platform hizmetlerinin sunulması, müşteri ve profesyonellerin eşleştirilmesi, sipariş ve ödeme süreçlerinin yürütülmesi, güvenlik ve dolandırıcılığın önlenmesi, müşteri desteği, muhasebe ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir.</p>
      <h2>4. Hukuki Sebep</h2>
      <p>Veriler; KVKK’nın 5. ve 6. maddelerinde belirtilen sözleşmenin kurulması veya ifası, hukuki yükümlülük, meşru menfaat, bir hakkın tesisi/kullanılması/korunması ve gerektiğinde açık rıza hukuki sebeplerine dayanılarak işlenir.</p>
      <h2>5. Veri Aktarımı</h2>
      <p>Kişisel veriler; hizmetin sunulması ve yasal yükümlülüklerin yerine getirilmesi amacıyla ödeme hizmeti sağlayıcıları, bankalar, bilişim ve teknoloji hizmet sağlayıcıları, muhasebe/finans hizmet sağlayıcıları, yetkili kamu kurumları ve mevzuatın izin verdiği diğer üçüncü kişilerle paylaşılabilir.</p>
      <h2>6. Ödeme İşlemleri</h2>
      <p>Platform üzerinden gerçekleştirilen ödeme ve para transferlerine ilişkin bilgiler, işlemlerin gerçekleştirilmesi, doğrulanması, eşleştirilmesi ve ilgili mevzuata uyum amacıyla işlenebilir ve yetkili ödeme kuruluşları, bankalar ve hizmet sağlayıcılarına aktarılabilir.</p>
      <h2>7. Çerezler ve Teknik Veriler</h2>
      <p>Prosinta; platformun güvenli, etkin ve kullanıcı ihtiyaçlarına uygun çalışması amacıyla çerezler, IP adresi, cihaz bilgileri ve benzeri teknik verileri kullanabilir. Zorunlu olmayan çerezler gerekli durumlarda kullanıcının tercihine sunulur.</p>
      <h2>8. Ticari Elektronik İletiler</h2>
      <p>Kullanıcıya ticari elektronik ileti gönderimi, gerekli hallerde ilgili mevzuata uygun olarak alınan onaya dayanır. Kullanıcı dilediği zaman ileti gönderimini durdurabilir.</p>
      <h2>9. Saklama Süresi</h2>
      <p>Kişisel veriler, işleme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen saklama süreleriyle sınırlı olarak muhafaza edilir.</p>
      <h2>10. İlgili Kişinin Hakları</h2>
      <p>KVKK’nın 11. maddesi kapsamında kullanıcı; kişisel verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme, işlenmesine itiraz etme ve kanunda belirtilen diğer haklarını kullanma hakkına sahiptir.</p>
      <h2>11. Başvuru</h2>
      <p>KVKK kapsamındaki talepler, [KEP Adresi / E-posta Adresi / Şirket Adresi] üzerinden Prosinta’ya iletilebilir.</p>
      <h2>12. Yürürlük</h2>
      <p>İşbu metin, yayımlandığı tarihte yürürlüğe girer. Prosinta, mevzuat ve hizmetlerindeki değişiklikler doğrultusunda metni güncelleyebilir.</p>

      <h2>Künye</h2>
      <ul>
        <li>Prosinta</li>
        <li>Prosinta Bilgi Teknolojileri Paz. ve Tic. A.Ş.</li>
        <li>Adres: [●]</li>
        <li>E-posta: [●]</li>
        <li>KEP Adresi: [●]</li>
      </ul>
    </LegalPage>
  );
}
