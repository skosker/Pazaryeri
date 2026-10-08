import { NextResponse, type NextRequest } from "next/server";
import { activeUser } from "@/lib/active-user";
import { csvFile } from "@/lib/csv";
import { parseDay } from "@/lib/intermediary";
import { VOUCHER_SERIES, listVouchers, voucherNumberLabel } from "@/lib/expense-voucher";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeZone: "Europe/Istanbul" });

/** Gider pusulaları for the accountant: one line per voucher, cancelled ones marked. */
export async function GET(request: NextRequest) {
  const user = await activeUser();
  if (!user || user.role !== "ADMIN") return new NextResponse("Yetkisiz", { status: 403 });

  const params = request.nextUrl.searchParams;
  const rows = await listVouchers({ from: parseDay(params.get("bas") ?? ""), to: parseDay(params.get("bit") ?? "", true) });

  const header = [
    "Seri", "Sıra No", "Tarih", "Adı Soyadı", "T.C. Kimlik No", "Adres", "IBAN", "İşin Mahiyeti",
    "Brüt Tutar", "Stopaj Oranı (%)", "Stopaj Tutarı", "Net Tutar", "Durum", "İptal Gerekçesi",
  ];
  const lines = rows.map((r) => [
    VOUCHER_SERIES, voucherNumberLabel(r.number), dateFmt.format(r.issuedAt), r.payeeName, r.payeeTckn, r.payeeAddress,
    r.payeeIban, r.items.map((i) => i.description).join(" / "), r.gross, r.withholdingPercent, r.withholding, r.net,
    r.cancelledAt ? "İptal" : "Geçerli", r.cancelReason,
  ]);
  const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date());
  return new NextResponse(csvFile([header, ...lines]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prosinta-gider-pusulalari-${stamp}.csv"`,
    },
  });
}
