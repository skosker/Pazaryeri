"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { legalLinks } from "@/components/legal-bar";

/**
 * The same five pages the bottom bar lists, as a side menu on the pages themselves —
 * these documents refer to one another constantly, so jumping between them should not
 * mean scrolling to the very bottom of the page.
 */
export function LegalNav() {
  const pathname = usePathname();

  return (
    <nav className="rounded-2xl border border-slate-200 bg-white p-3">
      <ul className="space-y-1">
        {legalLinks.map((link) => {
          const current = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                  current
                    ? "bg-purple-50 font-semibold text-purple-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
