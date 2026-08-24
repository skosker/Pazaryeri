import { aiPortraitProgress, hasReplicateKey } from "@/lib/ai-portraits";
import { AiPortraitRunner } from "./runner";

export default async function AdminAiPortraitsPage() {
  const progress = await aiPortraitProgress();
  const keyMissing = !hasReplicateKey();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">AI Portreler</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Üretilmiş freelancer profillerine, var olmayan kişilerin{" "}
        <span className="font-medium text-brand-navy">Türk portreleri</span> yapay zekâyla
        üretilip atanır. Stok fotoğrafın aksine yüzün Türk olması prompt&apos;la garanti
        edilir; kimsenin gerçek yüzü olmadığı için rıza/lisans sorunu da yoktur. Profilin
        ismine göre kadın/erkek seçilir. Gerçek kullanıcılara ve kendi yükledikleri
        görsellere dokunulmaz.
      </p>

      {keyMissing ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">REPLICATE_API_TOKEN tanımlı değil.</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>
              <a
                href="https://replicate.com/account/api-tokens"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline"
              >
                replicate.com/account/api-tokens
              </a>{" "}
              adresinden bir token al (kayıt + kart eklemen gerekir; üretim başına birkaç
              kuruş).
            </li>
            <li>
              Vercel&apos;de proje ayarlarından Environment Variables bölümüne{" "}
              <code className="rounded bg-amber-100 px-1">REPLICATE_API_TOKEN</code> olarak
              ekle.
            </li>
            <li>Projeyi yeniden dağıt (redeploy) ve bu sayfaya dön.</li>
          </ol>
          <p className="mt-3 text-amber-800">
            Yaklaşık maliyet: 1000+ profil için birkaç ile birkaç on dolar arası (Flux
            schnell modeli, üretim başına ~birkaç kuruş).
          </p>
        </div>
      ) : (
        <AiPortraitRunner initial={progress} keyMissing={keyMissing} />
      )}
    </div>
  );
}
