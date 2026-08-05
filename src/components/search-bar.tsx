"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        router.push(`/kategoriler?${params.toString()}`);
      }}
      className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus-within:border-purple-400"
    >
      <svg
        className="mr-2 h-4 w-4 shrink-0 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Hangi hizmete ihtiyacın var?"
        className="w-full bg-transparent outline-none placeholder:text-slate-400"
      />
    </form>
  );
}
