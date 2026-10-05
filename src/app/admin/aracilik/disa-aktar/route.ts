import { NextResponse, type NextRequest } from "next/server";
import { activeUser } from "@/lib/active-user";
import { csvFile } from "@/lib/csv";
import { PAYMENT_PROVIDER_LABEL, listIntermediaryRows, parseDay } from "@/lib/intermediary";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeZone: "Europe/Istanbul" });

export async function GET(request: NextRequest) {
  const user = await activeUser();
  if (!user || user.role !== "ADMIN") return new NextResponse("Yetkisiz", { status: 403 });

  const params = request.nextUrl.searchParams;
  const rows = await listIntermediaryRows({
    from: parseDay(params.get("bas") ?? ""),
    to: parseDay(params.get("bit") ?? "", true),
  });

  const header = [
    "Tamamlanma", "Sipariş No", "Sipariş Tarihi", "Hizmet", "Alıcı", "Alıcı E-posta", "Freelancer", "Freelancer E-posta",
    "Ödeme Yöntemi", "Sipariş Tutarı", "Prosinta İndirimleri", "Alıcının Ödediği", "Aracılık Oranı (%)",
    "Aracılık Hizmet Bedeli", "Net Hakediş", "Hakediş Durumu", "Hakediş Ödeme Tarihi", "IBAN", "Fatura No",
  ];
  const lines = rows.map((r) => [
    dateFmt.format(r.completedAt), r.orderId, dateFmt.format(r.orderedAt), r.service, r.buyer.name, r.buyer.email,
    r.seller.name, r.seller.email, r.payment ? (PAYMENT_PROVIDER_LABEL[r.payment.provider] ?? r.payment.provider) : "",
    r.gross, r.prosintaDiscounts, r.buyerPaid, r.commissionPercent, r.commission, r.net,
    r.payout.status === "PAID" ? "Ödendi" : r.payout.status === "FAILED" ? "Başarısız" : "Bekliyor",
    r.payout.paidAt ? dateFmt.format(r.payout.paidAt) : "", r.payout.iban, r.invoiceNo,
  ]);
  const csv = csvFile([header, ...lines]);
  const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date());
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prosinta-aracilik-dokumu-${stamp}.csv"`,
    },
  });
}
