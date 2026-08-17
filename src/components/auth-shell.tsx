import type { ReactNode } from "react";

/** Centres the auth forms in a single column; shared by /giris and /kayit. */
export function AuthShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16 sm:px-6">
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>{children}</div>
    </div>
  );
}
