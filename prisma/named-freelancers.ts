/**
 * Freelancer profiles and one gig each for real people who already have a hakediş
 * (payout) record, plus a matching gig for a slice of the bumped synthetic pool. Both
 * share the same gig-building logic; only where the price comes from differs.
 *
 * Named freelancers: the 161 people in freelancer_payouts (an admin-only ledger of
 * ödemeler this session imported by hand) get a real profile and a listing whose
 * standard package price is their payout amount — "the service on their page matches
 * what they were paid for". Their name is fixed; everything else (age, city, skills,
 * bio, avatar, profession) is derived the same deterministic way as the fully synthetic
 * thousand in synthetic-freelancers.ts.
 *
 * Bump gigs: a subset of the freelancers added when the generated pool was widened
 * (see SYNTHETIC_FREELANCER_COUNT) get a listing too, priced from their category's usual
 * range instead of a payout — most of the widened pool stays profile-only, matching how
 * the original thousand behave.
 */

import {
  professions,
  hash32,
  reader,
  pickCity,
  pickSome,
  buildBio,
  listOf,
  type SyntheticFreelancer,
} from "./synthetic-freelancers";
import { drawnAvatarUrl } from "../src/lib/avatar-seed";

const NAMED_EMAIL_DOMAIN = "demo.prosinta.com";

export const NAMED_FREELANCER_PAYOUTS: { name: string; iban: string; amount: number }[] = [
  { name: "Ümit Sandıkçı", iban: "TR960020500009488178900001", amount: 3000.00 },
  { name: "Müslüm Bayduz", iban: "TR280001000770624606495020", amount: 3000.00 },
  { name: "Hüseyin Özkan", iban: "TR460004600120888000332909", amount: 8500.00 },
  { name: "Emre Evlioğlu", iban: "TR580006200001500006818120", amount: 8000.00 },
  { name: "Bülent Güleyen", iban: "TR980006400000142450454681", amount: 16000.00 },
  { name: "Ali Salih", iban: "TR590001009010664669005002", amount: 3000.00 },
  { name: "Yıldırım Yıldız", iban: "TR250004600364888000233884", amount: 4900.00 },
  { name: "Enes Buğra Yavuz", iban: "TR180006400000142171910242", amount: 2500.00 },
  { name: "Serkan Akman", iban: "TR070006200051100006647002", amount: 11000.00 },
  { name: "Gencer Özkul", iban: "TR890006701000000077504212", amount: 9000.00 },
  { name: "Büyamin Demir", iban: "TR850006200050000006643810", amount: 3000.00 },
  { name: "Anas Almustafa", iban: "TR980082900009491295200588", amount: 3000.00 },
  { name: "Onurcan Gündoğdu", iban: "TR830001500158007391357223", amount: 4000.00 },
  { name: "Ömer Yatcı", iban: "TR560006200135700006620259", amount: 3500.00 },
  { name: "Ahmet Utku Akdeniz", iban: "TR870006200129800006667526", amount: 3000.00 },
  { name: "Ugur Kartal", iban: "TR880001200978700001019587", amount: 2000.00 },
  { name: "İbrahim Çakı", iban: "TR350004600221888000229505", amount: 8000.00 },
  { name: "Erdi Topuz", iban: "TR790001500158007319495136", amount: 4000.00 },
  { name: "Fatih Akçay", iban: "TR110006701000000021526043", amount: 8000.00 },
  { name: "Abdulgaffar Taşdemir", iban: "TR610001500158007320623667", amount: 4000.00 },
  { name: "Zafer Dalyaprak", iban: "TR240006400000134580709922", amount: 3000.00 },
  { name: "Bengü Hatice Yılmaz", iban: "TR620001009011053480405001", amount: 3133.00 },
  { name: "Ersin Cevik", iban: "TR850006200034700006615087", amount: 5000.00 },
  { name: "Mücahit Arslan", iban: "TR640015700000000091586657", amount: 2000.00 },
  { name: "Gökhan Çengel", iban: "TR650006200053400006669511", amount: 5000.00 },
  { name: "Onur Ersungur", iban: "TR370001000260772400695003", amount: 8000.00 },
  { name: "Mikail Turan", iban: "TR750006200120900006831050", amount: 4000.00 },
  { name: "Emre Kaleşi", iban: "TR970015700000000092914575", amount: 1323.00 },
  { name: "Feyzullah Yavuz", iban: "TR130006701000000032686924", amount: 2000.00 },
  { name: "Ümit İlingi", iban: "TR140015700000000119546934", amount: 2500.00 },
  { name: "Musa Onur", iban: "TR400015700000000203966924", amount: 4500.00 },
  { name: "Memiş İslam Gökyıldız", iban: "TR900015700000000095604705", amount: 3567.95 },
  { name: "İbrahim Acar", iban: "TR340004601094888000054826", amount: 2500.00 },
  { name: "Ümit Çetinkaya", iban: "TR090020500000612042800011", amount: 2599.00 },
  { name: "Nuri Can Doğanbek", iban: "TR400004600051888000115695", amount: 2589.00 },
  { name: "Mustafa Karalı", iban: "TR840011100000000103224747", amount: 2000.00 },
  { name: "Merve Ordukaya", iban: "TR820006200011100006843883", amount: 9060.00 },
  { name: "Halil İbrahim Akdaş", iban: "TR720001002358416862615002", amount: 3600.00 },
  { name: "Betül Kaplan", iban: "TR750013400002592352300001", amount: 8000.00 },
  { name: "Reber Acar", iban: "TR930006200043200006841401", amount: 13000.00 },
  { name: "Ahmet Korkmaz", iban: "TR950004600084888000147684", amount: 10000.00 },
  { name: "Senem Oğuz", iban: "TR080015700000000094280967", amount: 1500.00 },
  { name: "Volkan Karaoğlu", iban: "TR370006200008000006891893", amount: 4500.00 },
  { name: "Erhan Bostancı", iban: "TR350011100000000058250221", amount: 3000.00 },
  { name: "Şükran Şancı", iban: "TR820001002633610153695002", amount: 5137.00 },
  { name: "Tunahan Namlı", iban: "TR220015700000000141400890", amount: 7000.00 },
  { name: "İbrahim Tekdemir", iban: "TR580006200078200006850854", amount: 3000.00 },
  { name: "İrem Çapar", iban: "TR610010300000000058621373", amount: 2650.00 },
  { name: "Şahan Akpınar", iban: "TR590001000053935632795001", amount: 4000.00 },
  { name: "Hüseyin Artok", iban: "TR050015700000000132836775", amount: 4150.00 },
  { name: "Halil İbrahim Şahin", iban: "TR080006200075500006802031", amount: 5800.00 },
  { name: "Emre Turan", iban: "TR370006400000124003002569", amount: 48000.00 },
  { name: "Erhan Çetin", iban: "TR050006200110000006648361", amount: 20700.00 },
  { name: "Hasan Tanrıverdi", iban: "TR710006200151800006666617", amount: 20000.00 },
  { name: "Mehmet Emin Kömürcü", iban: "TR570001000499540798765001", amount: 10000.00 },
  { name: "Mehmet Akbaş", iban: "TR110015700000000066743195", amount: 100000.00 },
  { name: "Kazım Şahin", iban: "TR460001004004645421485008", amount: 10000.00 },
  { name: "Umut Yılmaz", iban: "TR360006701000000013179034", amount: 40500.00 },
  { name: "Emre Savar", iban: "TR790003200000000132446858", amount: 4000.00 },
  { name: "Burak Demirci", iban: "TR400006200030100006680341", amount: 4000.00 },
  { name: "Dilara Vardar", iban: "TR620011100000000166847540", amount: 2000.00 },
  { name: "Nurhan Selin Atabey", iban: "TR830004600991888000083635", amount: 8000.00 },
  { name: "Abdullah Yurtlu", iban: "TR210015700000000113782971", amount: 2000.00 },
  { name: "Tuncay Bilir", iban: "TR070004601377888000069680", amount: 3000.00 },
  { name: "Sadık Eş", iban: "TR050004600003888000179156", amount: 9400.00 },
  { name: "Doğukan Erdurgun", iban: "TR890013400002417166200044", amount: 30000.00 },
  { name: "Yıldırım Şahin", iban: "TR110004600155888000131387", amount: 25000.00 },
  { name: "Emrah İhtiyar", iban: "TR150004600254888000122873", amount: 2500.00 },
  { name: "Erman Yılmaz", iban: "TR520013400002225588000001", amount: 3000.00 },
  { name: "Hayrullah Kısakol", iban: "TR170015700000000071851883", amount: 8000.00 },
  { name: "Onur Türk", iban: "TR080006400000111410336894", amount: 2500.00 },
  { name: "Kenan Polat", iban: "TR870004600006888000400921", amount: 2000.00 },
  { name: "Songül Tuslak", iban: "TR810001002157941821005001", amount: 3000.00 },
  { name: "İsmail Hakkı Kara", iban: "TR950015700000000036766937", amount: 40000.00 },
  { name: "Meltem Toğlan", iban: "TR230006200101400006672135", amount: 11000.00 },
  { name: "Mümin Özer", iban: "TR930015700000000082191685", amount: 2500.00 },
  { name: "Hafize Sakarya", iban: "TR690001000165802126135001", amount: 7000.00 },
  { name: "Mehmet Aydın", iban: "TR360001200947700001048360", amount: 25000.00 },
  { name: "Berkan Saygın", iban: "TR910006200042500006947784", amount: 5700.00 },
  { name: "Reşat Göktürk", iban: "TR740004601237888000139397", amount: 9500.00 },
  { name: "Betül Ersoy", iban: "TR750015700000000110923312", amount: 10000.00 },
  { name: "Oğuzhan Aktürk", iban: "TR760006701000000076839414", amount: 3000.00 },
  { name: "Muslihittin Ateş", iban: "TR030015700000000204705081", amount: 2000.00 },
  { name: "Kartal Veziroğlu", iban: "TR980001500158007390711612", amount: 10000.00 },
  { name: "Süleyman Can Acısu", iban: "TR900015700000000128310583", amount: 5000.00 },
  { name: "Murat Durak", iban: "TR190006200104900006611989", amount: 54000.00 },
  { name: "Gökay Güney", iban: "TR380001009010586354105001", amount: 2000.00 },
  { name: "Recep Atiş", iban: "TR280015700000000205062949", amount: 10000.00 },
  { name: "Savaş Çalım", iban: "TR090006200054200006609466", amount: 2250.00 },
  { name: "Özkan Gel", iban: "TR030001500158007359136039", amount: 4000.00 },
  { name: "Görkem Düzgün", iban: "TR420006701000000058406825", amount: 2300.00 },
  { name: "Berkay Erdi Aydoğdu", iban: "TR850020500009682086000001", amount: 4000.00 },
  { name: "Bedri Uçar", iban: "TR630004600747888000333942", amount: 2073.00 },
  { name: "Berat Seçgin", iban: "TR690015700000000072413935", amount: 7040.00 },
  { name: "Mehmet Aslantaş", iban: "TR120006701000000046945263", amount: 50000.00 },
  { name: "Özkan Kandemir", iban: "TR710001200916700001065188", amount: 5000.00 },
  { name: "Dilara Kaya", iban: "TR290015700000000204206130", amount: 25000.00 },
  { name: "Bayram Candan", iban: "TR660001200954900001024665", amount: 19000.00 },
  { name: "Sefa Gül", iban: "TR500006701000000032349668", amount: 8000.00 },
  { name: "Erkan Öztürk", iban: "TR420004600681888000283688", amount: 10000.00 },
  { name: "Mert Varol", iban: "TR590001200164000001109635", amount: 50000.00 },
  { name: "Volkan Sevinç", iban: "TR440015700000000160327134", amount: 3000.00 },
  { name: "Kerim Kaçak", iban: "TR220015700000000158665726", amount: 3000.00 },
  { name: "İrem Özel Tuğlu", iban: "TR140001200977100001125080", amount: 2000.00 },
  { name: "Ceyhun Mutlu", iban: "TR840006400000112500472742", amount: 3000.00 },
  { name: "Ahmet Karadeniz", iban: "TR240006200054100006642181", amount: 2000.00 },
  { name: "Mustafa Akın", iban: "TR680013400001637919000001", amount: 5850.00 },
  { name: "Yusuf Emre Yaplıcan", iban: "TR510004600007888000715702", amount: 3800.00 },
  { name: "Hasan Ozel", iban: "TR590001004027525940625011", amount: 3000.00 },
  { name: "Avni Şardağ", iban: "TR910001200937700001024881", amount: 10500.00 },
  { name: "Orhan İpek", iban: "TR230006701000000029423567", amount: 5000.00 },
  { name: "Mehmet Nurullah Turan", iban: "TR530015700000000065549921", amount: 9400.00 },
  { name: "Mehmet Şahin", iban: "TR150004600381888000143295", amount: 9410.00 },
  { name: "Özkan İlal", iban: "TR300004600332888000314352", amount: 5000.00 },
  { name: "Volkan Barışkan", iban: "TR430006701000000076501284", amount: 5580.00 },
  { name: "Mutlu Süyüm", iban: "TR290014300000000023940213", amount: 23000.00 },
  { name: "Ercan Şeremet", iban: "TR030015700000000119023526", amount: 3500.00 },
  { name: "Halide Gezgin", iban: "TR980004601020888000193562", amount: 14000.00 },
  { name: "Ahmet Aydan", iban: "TR460001500158007313353011", amount: 2800.00 },
  { name: "Çetin Gör", iban: "TR890006701000000031047808", amount: 10000.00 },
  { name: "Ayse Erkan", iban: "TR690006701000000014846840", amount: 10000.00 },
  { name: "Bilal Tıkız", iban: "TR730013400002054194400001", amount: 15040.00 },
  { name: "İsmail Sarıgül", iban: "TR910006400000124310216020", amount: 5000.00 },
  { name: "Savaş Karatay", iban: "TR550006200037300006647313", amount: 15800.00 },
  { name: "Erdal Sürücü", iban: "TR570015700000000200907141", amount: 20000.00 },
  { name: "Büşra Demirbaş", iban: "TR870001500158007305754069", amount: 7000.00 },
  { name: "Celal Ergene", iban: "TR500001000051613335065002", amount: 7000.00 },
  { name: "İbrahim Efe Kömürcü", iban: "TR520006200115300006641624", amount: 2000.00 },
  { name: "Kenan Ermin", iban: "TR940006200057300006670249", amount: 4000.00 },
  { name: "Aytekin Süvari", iban: "TR810006200100200006859816", amount: 4300.00 },
  { name: "Gül Yaşar", iban: "TR060006701000000052545666", amount: 2000.00 },
  { name: "Enes Songur", iban: "TR410011100000000083456533", amount: 6000.00 },
  { name: "Berkant Keleş", iban: "TR040004601037888000020386", amount: 7230.00 },
  { name: "Güvercin Uyan", iban: "TR600013400002593749400001", amount: 15000.00 },
  { name: "Sinan Esen", iban: "TR770015700000000136456780", amount: 2000.00 },
  { name: "Bazen Ekiz", iban: "TR740020500009469962200002", amount: 2000.00 },
  { name: "Mustafa Taştan", iban: "TR160006701000000052018582", amount: 10000.00 },
  { name: "Ayşe Kocabaş", iban: "TR880001000140682527545001", amount: 2500.00 },
  { name: "Selami Şimşek", iban: "TR440001001935581700345002", amount: 100000.00 },
  { name: "Tamer Canki", iban: "TR630006701000000029499380", amount: 3000.00 },
  { name: "Mehmet Zafer Özdemir", iban: "TR670004600794888000085334", amount: 7600.00 },
  { name: "Mevlüt Çalıkuşu", iban: "TR630001001027661003285006", amount: 6500.00 },
  { name: "Ali Uzun", iban: "TR380011100000000071186863", amount: 2000.00 },
  { name: "Belgin Yavuz", iban: "TR500015700000000112296894", amount: 3000.00 },
  { name: "Ramazan Aslan", iban: "TR810006200052600006621345", amount: 2000.00 },
  { name: "Duygu Karademir", iban: "TR540006200148900006898995", amount: 3000.00 },
  { name: "Nurcennet Buyakutluğ", iban: "TR490001000458844932415002", amount: 2000.00 },
  { name: "Hasan Hüseyin Yılmaz", iban: "TR660010300000000080987640", amount: 6012.00 },
  { name: "Barış Avcı", iban: "TR700015700000000073129195", amount: 4000.00 },
  { name: "Ebru Uyanık", iban: "TR920001001998660756275001", amount: 2000.00 },
  { name: "Bora Gedik", iban: "TR180006701000000012363200", amount: 3000.00 },
  { name: "Tülay Savaş", iban: "TR440015700000000144597323", amount: 3000.00 },
  { name: "Özgür Deniz Kaya", iban: "TR600006400000142040920298", amount: 42000.00 },
  { name: "Cansel Özmen", iban: "TR170001000425796167385001", amount: 6050.00 },
  { name: "Soner Zeybek", iban: "TR810011100000000148092733", amount: 7240.00 },
  { name: "Evindar Karaduman", iban: "TR080001009010621538005002", amount: 3000.00 },
  { name: "Esma Ocak", iban: "TR440001000219914402105001", amount: 4000.00 },
  { name: "Yeşim Aygün", iban: "TR610006200070600006625073", amount: 10000.00 },
  { name: "Şahin Çobanoğlu", iban: "TR820006200001300006637375", amount: 4000.00 },
  { name: "Emrecan Erdenler", iban: "TR300006701000000052945844", amount: 10000.00 },
  { name: "Alperen Başkan", iban: "TR740015700000000113169462", amount: 4000.00 },
];

/** ASCII, path/e-mail-safe form of a name (mirrors avatar-seed's slugifyName). */
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[âà]/g, "a")
    .replace(/[îì]/g, "i")
    .replace(/[ûù]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Per-category price band a gig's standard package is drawn from — mirrors the ranges
 * bulk-gigs-data.ts uses for the hand-authored catalogue, so a generated listing prices
 * like the rest of the marketplace instead of standing out. */
export const categoryPriceBands: Record<string, { min: number; max: number }> = {
  "grafik-tasarim": { min: 1200, max: 6000 },
  "yazilim-web": { min: 3500, max: 22000 },
  "yazi-ceviri": { min: 500, max: 3500 },
  "video-animasyon": { min: 1500, max: 9000 },
  "dijital-pazarlama": { min: 2500, max: 14000 },
  "muzik-ses": { min: 800, max: 5000 },
  "is-danismanlik": { min: 3000, max: 17000 },
  "egitim-ders": { min: 600, max: 4000 },
  "ai-otomasyon": { min: 4000, max: 26000 },
  "veri-analitik": { min: 3000, max: 19000 },
};

const coverColors = ["rose", "sky", "violet", "amber", "emerald", "indigo"];

/**
 * Draws a standard-package price from a category's usual range, deterministic from a
 * seed key. Used for every generated gig regardless of kind, so a "named" freelancer's
 * listing and a "bump" one in the same profession land in the same price neighbourhood —
 * a payout or any other real-world number that has nothing to do with what the gig
 * itself is worth never becomes its listed price.
 */
function bandPrice(categorySlug: string, seedKey: string): number {
  const band = categoryPriceBands[categorySlug] ?? { min: 1000, max: 8000 };
  const r = reader(hash32(`band:${seedKey}`));
  return band.min + r(band.max - band.min);
}

/** Rounds to a "clean" price the way a person would actually type one in. */
function roundPrice(value: number) {
  if (value < 2000) return Math.round(value / 10) * 10;
  if (value < 20000) return Math.round(value / 50) * 50;
  return Math.round(value / 100) * 100;
}

const gigTitleTemplates = [
  (title: string) => `${title} olarak profesyonel destek veriyorum`,
  (title: string, skills: string[]) => `${title} olarak ${listOf(skills, 2)} konularında hizmet veriyorum`,
  (title: string) => `İhtiyacınıza özel ${title.toLowerCase()} hizmeti sunuyorum`,
  (title: string, skills: string[]) => `${listOf(skills, 2)} alanında ${title.toLowerCase()} olarak çalışıyorum`,
];

const gigDescriptionTemplates = [
  (title: string, skills: string[], years: number) =>
    `${listOf(skills, 3)} konularında ${years} yıllık deneyimle çalışıyorum. İhtiyacınızı netleştirdikten sonra hızlı ve düzenli iletişimle projeyi teslim ediyorum.`,
  (title: string, skills: string[]) =>
    `${title} olarak ${listOf(skills, 3)} alanlarında hizmet veriyorum. Teslim tarihine sadık kalır, süreç boyunca güncel bilgi veririm.`,
  (title: string, skills: string[], years: number) =>
    `${years} yıldır ${title.toLowerCase()} olarak çalışıyorum; ${listOf(skills, 2)} konularında uzmanım. Kaynak dosyalar teslimat kapsamına dahildir.`,
];

/** Longer/more revisions the pricier the standard package is — matches the app's own feel. */
function deliveryAndRevisions(standardPrice: number) {
  if (standardPrice < 2000) return { delivery: 2, revisions: 1 };
  if (standardPrice < 5000) return { delivery: 4, revisions: 2 };
  if (standardPrice < 10000) return { delivery: 7, revisions: 2 };
  if (standardPrice < 30000) return { delivery: 14, revisions: 3 };
  return { delivery: 21, revisions: 4 };
}

export type GeneratedGig = {
  slug: string;
  title: string;
  description: string;
  coverColor: string;
  categorySlug: string;
  packages: {
    tier: "BASIC" | "STANDARD" | "PREMIUM";
    name: string;
    description: string;
    price: number;
    deliveryDays: number;
    revisionCount: number;
  }[];
};

/** Builds one gig + its three packages for a profession/skill set, given a standard price
 * and a seed so two different freelancers in the same profession do not read identically. */
function buildGig(
  seed: string,
  index: number,
  title: string,
  skills: string[],
  years: number,
  categorySlug: string,
  standardPrice: number,
  slugSuffix: string
): GeneratedGig {
  const r = reader(hash32(`gig:${seed}`));
  const gigTitle = gigTitleTemplates[r(gigTitleTemplates.length)](title, skills);
  const description = gigDescriptionTemplates[r(gigDescriptionTemplates.length)](title, skills, years);
  const slug = `${slugify(gigTitle)}-${slugSuffix}`;
  const { delivery, revisions } = deliveryAndRevisions(standardPrice);

  const basicPrice = roundPrice(standardPrice * 0.6);
  const premiumPrice = roundPrice(standardPrice * 1.6);

  return {
    slug,
    title: gigTitle,
    description,
    coverColor: coverColors[index % coverColors.length],
    categorySlug,
    packages: [
      {
        tier: "BASIC",
        name: "Başlangıç",
        description: `Temel kapsam: ${listOf(skills, 1)}.`,
        price: basicPrice,
        deliveryDays: Math.max(1, delivery - 2),
        revisionCount: Math.max(1, revisions - 1),
      },
      {
        tier: "STANDARD",
        name: "Standart",
        description,
        price: roundPrice(standardPrice),
        deliveryDays: delivery,
        revisionCount: revisions,
      },
      {
        tier: "PREMIUM",
        name: "Premium",
        description: `Genişletilmiş kapsam: ${listOf(skills, skills.length)}, öncelikli destek.`,
        price: premiumPrice,
        deliveryDays: delivery + 3,
        revisionCount: revisions + 2,
      },
    ],
  };
}

export type NamedFreelancer = {
  email: string;
  name: string;
  iban: string;
  amount: number;
  title: string;
  age: number;
  city: string;
  skills: string[];
  image: string;
  bio: string;
  categorySlug: string;
  isOnline: boolean;
  isPro: boolean;
  gig: GeneratedGig;
};

/** The 161 real-named freelancers, each with one gig priced at what they were paid. */
export function generateNamedFreelancers(): NamedFreelancer[] {
  return NAMED_FREELANCER_PAYOUTS.map((person, index) => {
    const email = `${slugify(person.name)}-frl${index + 1}@${NAMED_EMAIL_DOMAIN}`;
    const profession = professions[index % professions.length];
    const r = reader(hash32(email));

    const age = 22 + Math.min(r(37), r(37));
    const city = pickCity(r);
    const skills = pickSome(profession.skills, 3 + r(3), r);
    const years = Math.max(1, Math.min(age - 21, 2 + r(13)));
    const bio = buildBio(person.name.split(" ")[0], profession.title, years, city, skills, r);

    const standardPrice = bandPrice(profession.categorySlug, email);
    const gig = buildGig(
      email,
      index,
      profession.title,
      skills,
      years,
      profession.categorySlug,
      standardPrice,
      `frl-${index + 1}`
    );

    return {
      email,
      name: person.name,
      iban: person.iban,
      amount: person.amount,
      title: profession.title,
      age,
      city: city.name,
      skills,
      image: drawnAvatarUrl(person.name, email),
      bio,
      categorySlug: profession.categorySlug,
      isOnline: r(3) === 0,
      isPro: r(9) === 0,
      gig,
    };
  });
}

/** One gig for a slice of the fully-synthetic pool, priced from its category's usual
 * range rather than a payout. Reuses the exact same title/description templates as the
 * named freelancers so a visitor cannot tell which kind of listing they are looking at. */
export function buildGigForSyntheticFreelancer(
  person: SyntheticFreelancer,
  index: number
): GeneratedGig {
  const band = categoryPriceBands[person.categorySlug] ?? { min: 1000, max: 8000 };
  const r = reader(hash32(`band:${person.email}`));
  const standardPrice = band.min + r(band.max - band.min);
  // years is not stored on SyntheticFreelancer; derive the same way the profile did.
  const years = Math.max(1, Math.min(person.age - 21, 2 + r(13)));

  return buildGig(
    person.email,
    index,
    person.title,
    person.skills,
    years,
    person.categorySlug,
    standardPrice,
    `bump-${index + 1}`
  );
}
