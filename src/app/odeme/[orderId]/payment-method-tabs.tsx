"use client";

import { useState, type ReactNode } from "react";

export function PaymentMethodTabs({
  cardContent,
  bankContent,
}: {
  cardContent: ReactNode;
  bankContent: ReactNode;
}) {
  const [tab, setTab] = useState<"card" | "bank">("bank");

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setTab("bank")}
          className={`rounded-full py-2 transition ${
            tab === "bank" ? "bg-white text-brand-navy shadow-sm" : "text-slate-500"
          }`}
        >
          Havale/EFT ile Öde
        </button>
        <button
          type="button"
          onClick={() => setTab("card")}
          className={`rounded-full py-2 transition ${
            tab === "card" ? "bg-white text-brand-navy shadow-sm" : "text-slate-500"
          }`}
        >
          Kart ile Öde
        </button>
      </div>

      <div className={tab === "bank" ? "" : "hidden"}>{bankContent}</div>
      <div className={tab === "card" ? "" : "hidden"}>{cardContent}</div>
    </div>
  );
}
