import type { OrderStatus } from "@/generated/prisma/enums";

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Ödeme Bekleniyor",
  PAID: "Ödendi",
  IN_PROGRESS: "Devam Ediyor",
  DELIVERED: "Teslim Edildi",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

export const orderStatusColor: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700",
  PAID: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};
