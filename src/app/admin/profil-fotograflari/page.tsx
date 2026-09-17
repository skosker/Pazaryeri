import Link from "next/link";
import { hasPexelsKey } from "@/lib/cover-photos";
import { hasModerationKey } from "@/lib/photo-moderation";
import { profilePhotoProgress } from "@/lib/profile-photos";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/user-avatar";
import { ProfilePhotoRunner } from "./runner";
import { approvePendingPhotoAction, rejectPendingPhotoAction } from "./actions";

export default async function AdminProfilePhotosPage() {
  const progress = await profilePhotoProgress();
  const keyMissing = !hasPexelsKey();

  const pendingPhotos = await prisma.user.findMany({
    where: { pendingImage: { not: null } },
    select: { id: true, name: true, email: true, pendingImage: true, photoFlagReason: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      {pendingPhotos.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-brand-navy">
            Uygunsuz Olabilecek Profil Fotoğrafları ({pendingPhotos.length})
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Kullanıcıların kendi yüklediği fotoğraflar, otomatik denetim tarafından uygunsuz
            olabilir diye işaretlendi ve onaylanana kadar profilde görünmüyor.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingPhotos.map((user) => (
              <div key={user.id} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} image={user.pendingImage} className="h-14 w-14 text-lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-navy">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                {user.photoFlagReason && (
                  <p className="mt-3 text-xs text-amber-800">{user.photoFlagReason}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <form action={approvePendingPhotoAction.bind(null, user.id)}>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Onayla
                    </button>
                  </form>
                  <form action={rejectPendingPhotoAction.bind(null, user.id)}>
                    <button
                      type="submit"
                      className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Reddet
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          {!hasModerationKey() && (
            <p className="mt-4 text-xs text-slate-400">
              ANTHROPIC_API_KEY tanımlı değilken yeni yüklemeler denetlenmeden doğrudan
              yayınlanır — burada yalnızca anahtar tanımlıyken işaretlenenler görünür.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-navy">Profil Fotoğrafları</h1>
        {progress.withPhoto > 0 && (
          <Link
            href="/admin/profil-fotograflari/incele"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Fotoğrafları İncele ({progress.withPhoto})
          </Link>
        )}
      </div>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Üretilmiş freelancer profillerine Pexels&apos;ten gerçek portre fotoğrafı atanır.
        Arama, profilin ismine göre kadın/erkek olarak ayrılır ve aynı fotoğraf iki profilde
        kullanılmaz. Gerçek kullanıcılara ve kendi yükledikleri görsellere dokunulmaz;
        fotoğraf düşmeyen profiller çizilen avatarla görünmeye devam eder. Çekilen fotoğrafları
        tek tek gözden geçirip uymayanları avatara döndürmek için{" "}
        <span className="font-medium text-brand-navy">Fotoğrafları İncele</span>&apos;yi kullan.
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
        <ProfilePhotoRunner initial={progress} keyMissing={keyMissing} />
      )}
    </div>
  );
}
