import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <Logo />
          <p className="max-w-md text-sm text-slate-500">
            Grafik tasarımdan yazılıma, binlerce yetenekli freelancer arasından seç,
            dakikalar içinde işine başla.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Profestia. Tüm hakları saklıdır.</span>
          <span>Ödemeler iyzico güvencesiyle korunmaktadır.</span>
        </div>
      </div>
    </footer>
  );
}
