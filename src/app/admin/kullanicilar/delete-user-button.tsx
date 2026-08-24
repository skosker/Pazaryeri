"use client";

import { useTransition } from "react";
import { deleteUserAction } from "./actions";

/**
 * Deleting a user cascades to their gigs, orders, reviews and payouts, and cannot be
 * undone — so the click is gated behind a confirm that spells out what goes with them.
 * For anything reversible the admin should suspend instead.
 */
export function DeleteUserButton({
  userId,
  name,
  gigCount,
  orderCount,
}: {
  userId: string;
  name: string;
  gigCount: number;
  orderCount: number;
}) {
  const [pending, startTransition] = useTransition();

  function confirmAndDelete() {
    const extras: string[] = [];
    if (gigCount > 0) extras.push(`${gigCount} ilanı ve bu ilanlardaki tüm siparişler`);
    if (orderCount > 0) extras.push(`verdiği ${orderCount} sipariş`);
    const tail = extras.length
      ? ` ${extras.join(", ")} ve bağlı yorum/hakedişleri de silinecek.`
      : "";

    const ok = window.confirm(
      `"${name}" kalıcı olarak silinsin mi?${tail} Bu işlem geri alınamaz. Geçici bir önlem istiyorsan "Askıya Al" kullan.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (!result.ok) window.alert(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={confirmAndDelete}
      disabled={pending}
      className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
    >
      {pending ? "Siliniyor..." : "Sil"}
    </button>
  );
}
