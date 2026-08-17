import Link from "next/link";

const roles = [
  {
    role: "BUYER",
    emoji: "💼",
    title: "Hizmet Alacağım",
    description: "İhtiyacın olan işi tarif et, doğru freelancer'ı bul.",
    tint: "from-purple-100 to-fuchsia-100",
  },
  {
    role: "FREELANCER",
    emoji: "💻",
    title: "Hizmet Vereceğim",
    description: "İlanını yayınla, işini büyüt, kazanmaya başla.",
    tint: "from-indigo-100 to-purple-100",
  },
] as const;

/** First step of signup: the choice sets the role the account is created with. */
export function RolePicker() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
        Profestia&apos;ya hoş geldin
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roles.map((option) => (
          <Link
            key={option.role}
            href={`/kayit?role=${option.role}`}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100"
          >
            <span
              className={`flex h-32 items-center justify-center rounded-xl bg-gradient-to-br ${option.tint} text-5xl`}
              aria-hidden
            >
              {option.emoji}
            </span>
            <span className="mt-4 flex items-center gap-1.5 font-semibold text-brand-navy">
              {option.title}
              <span className="transition group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </span>
            <span className="mt-1 block text-sm text-slate-500">{option.description}</span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-semibold text-purple-700 hover:underline">
          Giriş Yap
        </Link>
      </p>

      <p className="mt-3 text-xs text-slate-400">
        Seçimin kalıcı değil — sonradan panelinden de hizmet vermeye başlayabilirsin.
      </p>
    </div>
  );
}
