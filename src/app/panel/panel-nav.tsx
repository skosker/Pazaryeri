"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PanelNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? "bg-purple-50 text-purple-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
