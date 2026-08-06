import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

const highlights = [
  "iyzico güvencesiyle korunan ödemeler",
  "İş onaylanmadan ödeme satıcıya aktarılmaz",
  "Binlerce doğrulanmış freelancer",
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-navy p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 opacity-30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 opacity-20 blur-3xl"
        />

        <div className="relative">
          <Logo textClassName="text-white" />
        </div>

        <div className="relative">
          <p className="text-2xl font-bold leading-snug">
            İşini bilen freelancer&apos;larla
            <br /> projeni hayata geçir.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/70">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Profestia</p>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
