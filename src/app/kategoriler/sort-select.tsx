"use client";

import { useRouter, usePathname } from "next/navigation";

const options = [
  { value: "uygun", label: "En Uygun" },
  { value: "yeni", label: "En Yeni" },
  { value: "fiyat-artan", label: "Fiyat (Artan)" },
  { value: "fiyat-azalan", label: "Fiyat (Azalan)" },
];

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={value}
      onChange={(e) => {
        const params = new URLSearchParams(window.location.search);
        params.set("sirala", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 outline-none focus:border-purple-400"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
