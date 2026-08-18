import type { ReactNode } from "react";

/**
 * Centres the auth forms horizontally and keeps them near the top of the page, so the
 * first thing on screen is the form rather than empty space. Shared by /giris and /kayit.
 */
export function AuthShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] justify-center px-4 pb-16 pt-10 sm:px-6">
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>{children}</div>
    </div>
  );
}
