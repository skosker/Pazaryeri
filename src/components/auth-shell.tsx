import type { ReactNode } from "react";

/**
 * Centres the auth forms on the first screen with the bottom band (LegalBar, ~18rem) still
 * in view, so a short form (the role picker, login) does not leave a block of empty page
 * under it. A form taller than that simply grows the box. Shared by /giris and /kayit.
 */
export function AuthShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-[calc(100vh-22rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-md"}`}>{children}</div>
    </div>
  );
}
