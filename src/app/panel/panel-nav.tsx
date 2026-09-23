"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PanelNav({ items }: { items: { href: string; label: string; badge?: number }[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        // Sub-pages (a single conversation, a gig being edited) keep their section lit.
        const active = pathname === item.href || (item.href !== "/panel" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? "bg-purple-50 text-purple-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"
            }`}
          >
            {item.label}
            {item.badge ? (
              <span className="rounded-full bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
