import Link from "next/link";

export default async function RegisterSuccessPage(props: PageProps<"/kayit/basarili">) {
  const searchParams = await props.searchParams;
  const wantsToSell = searchParams.satici === "1";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-2xl text-purple-600">
        ✉️
      </div>
      <h1 className="mt-4 text-xl font-bold text-brand-navy">E-postanı kontrol et</h1>
      <p className="mt-2 text-sm text-slate-500">
        Hesabını aktifleştirmek için sana gönderdiğimiz doğrulama linkine tıklaman gerekiyor.
        E-posta birkaç dakika içinde gelmezse spam klasörünü de kontrol et.
      </p>

      {wantsToSell && (
        <p className="mt-4 rounded-xl bg-purple-50 px-4 py-3 text-sm text-purple-800">
          Freelancer olmak için: doğrulama sonrası giriş yap, üst menüdeki{" "}
          <strong>Freelancer Ol</strong> ile hesabını satıcı hesabına çevir.
        </p>
      )}

      <Link
        href="/giris"
        className="brand-gradient mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Giriş Yap
      </Link>
    </div>
  );
}
