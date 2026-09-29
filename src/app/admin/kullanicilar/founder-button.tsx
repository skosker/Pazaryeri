"use client";

import { useTransition } from "react";
import { setFounderAction } from "./actions";

/** Take the Kurucu Freelancer badge back (confirmed first), or give it back. */
export function FounderButton({ userId, name, active }: { userId: string; name: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  function run() {
    if (
      active &&
      !window.confirm(
        `"${name}" adlı kullanıcının Kurucu Freelancer rozeti geri alınsın mı? Rozet profilinden ve ilanlarından kalkar, kontenjandaki yeri boşalır ve ilan yayınlasa da otomatik olarak yeniden verilmez.`
      )
    ) {
      return;
    }
    startTransition(() => setFounderAction(userId, !active));
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
        active ? "text-red-600 hover:bg-red-50" : "text-purple-700 hover:bg-purple-50"
      }`}
    >
      {pending ? "Kaydediliyor..." : active ? "Rozeti Geri Al" : "Rozeti Geri Ver"}
    </button>
  );
}
