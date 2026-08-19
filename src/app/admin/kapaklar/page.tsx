import { coverPhotoProgress, hasPexelsKey } from "@/lib/cover-photos";
import { CoverPhotoRunner } from "./runner";

export default async function AdminCoverPhotosPage() {
  const progress = await coverPhotoProgress();
  const keyMissing = !hasPexelsKey();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">İlan Kapakları</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Her ilana, başlığındaki kelimelerden çıkarılan bir aramayla Pexels&apos;ten fotoğraf
        atanır. Aynı fotoğraf iki ilanda kullanılmaz. Satıcının kendi yüklediği kapaklara
        dokunulmaz. Fotoğrafı olmayan ilanlar çizimli kapakla görünmeye devam eder.
      </p>

      {keyMissing ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">PEXELS_API_KEY tanımlı değil.</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>
              <a
                href="https://www.pexels.com/api/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline"
              >
                pexels.com/api
              </a>{" "}
              adresinden ücretsiz bir anahtar al.
            </li>
            <li>
              Vercel&apos;de proje ayarlarından Environment Variables bölümüne{" "}
              <code className="rounded bg-amber-100 px-1">PEXELS_API_KEY</code> olarak ekle.
            </li>
            <li>Projeyi yeniden dağıt (redeploy) ve bu sayfaya dön.</li>
          </ol>
        </div>
      ) : (
        <CoverPhotoRunner initial={progress} keyMissing={keyMissing} />
      )}
    </div>
  );
}
