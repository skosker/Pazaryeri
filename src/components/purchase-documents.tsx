import { COMPANY } from "@/lib/company";
import { formatPrice } from "@/lib/format-price";

/**
 * Ön Bilgilendirme Formu and Mesafeli Hizmet Sözleşmesi for Prosinta's own paid services
 * (membership, Öne Çıkar, corporate plans), filled in for the purchase at hand. Shown in a
 * pop-up on the checkout page; the buyer must accept both before paying.
 */
export type PurchaseInfo = {
  /** "Prosinta Pro Plus üyelik paketi (Yıllık, 12 ay)" */
  service: string;
  /** What the service gives, one line each. */
  features: string[];
  price: number;
  /** "12 ay", "30 gün" */
  duration: string;
  buyer: {
    name: string;
    email: string;
    company?: { name: string; taxOffice: string | null; taxNumber: string | null; address: string | null } | null;
  };
  /** Consumer purchase (a person, not a company): cayma hakkı rules apply. */
  consumer: boolean;
};

const today = () =>
  new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "Europe/Istanbul" }).format(new Date());

function Parties({ info }: { info: PurchaseInfo }) {
  const company = info.buyer.company;
  return (
    <>
      <p>
        <strong>Satıcı (Hizmet Sağlayıcı):</strong> {COMPANY.name} · {COMPANY.address} · Ticaret Sicil No:{" "}
        {COMPANY.tradeRegistry} · {COMPANY.taxOffice} V.D. {COMPANY.taxNumber} · {COMPANY.email}
      </p>
      <p>
        <strong>Alıcı:</strong>{" "}
        {company
          ? `${company.name}${company.taxOffice ? ` · ${company.taxOffice}` : ""}${company.taxNumber ? ` · ${company.taxNumber}` : ""}${company.address ? ` · ${company.address}` : ""} (yetkili: ${info.buyer.name})`
          : info.buyer.name}{" "}
        · {info.buyer.email}
      </p>
    </>
  );
}

function ServiceDetails({ info }: { info: PurchaseInfo }) {
  return (
    <>
      <p>
        <strong>Hizmet:</strong> {info.service}
      </p>
      <ul>
        {info.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p>
        <strong>Toplam bedel:</strong> {formatPrice(info.price)} TL (tüm vergiler dahil). <strong>Süre:</strong>{" "}
        {info.duration}; ödemenin onaylandığı anda başlar, otomatik yenilenmez.
      </p>
      <p>
        <strong>Ödeme:</strong> Havale/EFT, kurumsal bakiye ya da Platform’da sunulan kart ödeme altyapısı ile peşin.
        Havale/EFT ödemelerinde hizmet, ödeme Satıcı tarafından onaylandığında başlar.
      </p>
    </>
  );
}

function Withdrawal({ info }: { info: PurchaseInfo }) {
  return info.consumer ? (
    <p>
      <strong>Cayma hakkı:</strong> Hizmet, ödeme onayıyla birlikte elektronik ortamda anında ifa edilmeye başlandığından,
      Mesafeli Sözleşmeler Yönetmeliği’nin 15 inci maddesinin birinci fıkrasının (ğ) bendi uyarınca cayma hakkı
      bulunmamaktadır. Alıcı, hizmetin hemen başlamasını onaylayarak bunu kabul eder. Hizmetin Satıcı’dan kaynaklanan bir
      sebeple sunulamaması, mükerrer ödeme veya hatalı tahsilat hâllerinde bedel iade edilir.
    </p>
  ) : (
    <p>
      <strong>Cayma hakkı:</strong> Alım tacir/tüzel kişi sıfatıyla yapıldığından tüketici mevzuatındaki cayma hakkı
      uygulanmaz. Hizmetin Satıcı’dan kaynaklanan bir sebeple sunulamaması, mükerrer ödeme veya hatalı tahsilat
      hâllerinde bedel iade edilir.
    </p>
  );
}

export function OnBilgilendirmeFormu({ info }: { info: PurchaseInfo }) {
  return (
    <>
      <p>Tarih: {today()}</p>
      <h2>1. Taraflar</h2>
      <Parties info={info} />
      <h2>2. Hizmetin Temel Nitelikleri, Bedeli ve Süresi</h2>
      <ServiceDetails info={info} />
      <h2>3. Cayma Hakkı ve İade</h2>
      <Withdrawal info={info} />
      <h2>4. Şikâyet ve Başvuru</h2>
      <p>
        Şikâyetlerini {COMPANY.email} adresine iletebilirsin.
        {info.consumer &&
          " Tüketiciler, Ticaret Bakanlığı’nca her yıl ilan edilen parasal sınırlar dâhilinde Tüketici Hakem Heyetlerine, bu sınırları aşan uyuşmazlıklarda Tüketici Mahkemelerine başvurabilir."}
      </p>
      <p>
        Bu form, Mesafeli Sözleşmeler Yönetmeliği’nin 5 inci maddesi uyarınca, Mesafeli Hizmet Sözleşmesi kurulmadan önce
        Alıcı’yı bilgilendirmek amacıyla sunulmuştur.
      </p>
    </>
  );
}

export function MesafeliHizmetSozlesmesi({ info }: { info: PurchaseInfo }) {
  return (
    <>
      <p>Tarih: {today()}</p>
      <h2>Madde 1 – Taraflar</h2>
      <Parties info={info} />
      <h2>Madde 2 – Konu</h2>
      <p>
        İşbu sözleşmenin konusu, Alıcı’nın Platform üzerinden elektronik ortamda satın aldığı aşağıdaki hizmetin
        sunulmasına ilişkin tarafların hak ve yükümlülükleridir. Sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında
        Kanun ve Mesafeli Sözleşmeler Yönetmeliği{info.consumer ? "" : " ile 6102 sayılı Türk Ticaret Kanunu"} hükümlerine
        tabidir.
      </p>
      <ServiceDetails info={info} />
      <h2>Madde 3 – İfa</h2>
      <p>
        Satıcı, hizmeti ödemenin onaylandığı andan itibaren belirtilen süre boyunca Platform üzerinde sunar. Hizmetin
        kapsamı ve kuralları Üyelik Sözleşmesi’nin 6/A maddesinde düzenlenmiştir. Hizmet belirli bir sıralama, görüntülenme,
        sipariş veya gelir garantisi içermez.
      </p>
      <h2>Madde 4 – Cayma Hakkı ve İade</h2>
      <Withdrawal info={info} />
      <h2>Madde 5 – Fatura</h2>
      <p>Hizmet bedeline ilişkin fatura, Alıcı’nın Platform’daki bilgileriyle mevzuata uygun olarak düzenlenir.</p>
      <h2>Madde 6 – Uyuşmazlıklar ve Yürürlük</h2>
      <p>
        Uyuşmazlıklarda{info.consumer ? " Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri" : " İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri"}{" "}
        yetkilidir. Alıcı, ödeme sayfasında onay kutusunu işaretleyerek işbu sözleşmeyi elektronik ortamda kurmuş olur;
        sözleşme ödeme tamamlandığında yürürlüğe girer.
      </p>
    </>
  );
}
