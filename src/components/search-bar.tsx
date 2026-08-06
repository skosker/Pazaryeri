"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  initialQuery = "",
  size = "md",
}: {
  initialQuery?: string;
  size?: "md" | "lg";
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  const isLarge = size === "lg";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        router.push(`/kategoriler?${params.toString()}`);
      }}
      className={`flex items-center rounded-full border bg-white transition focus-within:border-purple-400 ${
        isLarge
          ? "border-slate-200 py-1.5 pl-5 pr-1.5 shadow-lg shadow-purple-100/60"
          : "border-slate-200 bg-slate-50 px-4 py-2 text-sm"
      }`}
    >
      <svg
        className={`mr-2 shrink-0 text-slate-400 ${isLarge ? "h-5 w-5" : "h-4 w-4"}`}
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
        className={`w-full bg-transparent outline-none placeholder:text-slate-400 ${isLarge ? "text-base" : ""}`}
      />
      {isLarge && (
        <button
          type="submit"
          className="brand-gradient shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Ara
        </button>
      )}
    </form>
  );
}
