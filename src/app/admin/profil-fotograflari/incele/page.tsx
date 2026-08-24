import Link from "next/link";
import { listPhotoProfiles } from "@/lib/profile-photos";
import { ReviewGrid } from "./review-grid";

export default async function ProfilePhotoReviewPage() {
  const profiles = await listPhotoProfiles();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-navy">Fotoğraf İnceleme</h1>
        <Link
          href="/admin/profil-fotograflari"
          className="text-sm font-medium text-slate-500 hover:text-brand-navy"
        >
          ← Profil Fotoğrafları
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Çekilen bütün fotoğraflar burada. Stok araması fotoğraftaki kişinin kim olduğunu
        garanti edemez; gözüne takılan, profile uymayan bir yüzü altındaki{" "}
        <span className="font-medium text-brand-navy">Avatara döndür</span> ile çizime
        çevir. Değişiklik anında geçerli olur.
      </p>

      <div className="mt-6">
        <ReviewGrid profiles={profiles} />
      </div>
    </div>
  );
}
