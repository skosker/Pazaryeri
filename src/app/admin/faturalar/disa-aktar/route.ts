import { NextResponse, type NextRequest } from "next/server";
import { activeUser } from "@/lib/active-user";
import { getSettings } from "@/lib/settings";
import { INVOICE_KIND_LABEL, listInvoiceRows, parseInvoiceKind, splitVat } from "@/lib/invoices";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeZone: "Europe/Istanbul" });

/** Turkish Excel: ";" between columns, "," for decimals, a BOM so the letters come out right. */
function cell(value: string | number | null | undefined): string {
  const text =
    typeof value === "number" ? value.toFixed(2).replace(".", ",") : String(value ?? "");
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: NextRequest) {
  const user = await activeUser();
  if (!user || user.role !== "ADMIN") return new NextResponse("Yetkisiz", { status: 403 });

  const done = request.nextUrl.searchParams.get("durum") === "kesilen";
  const kind = parseInvoiceKind(request.nextUrl.searchParams.get("tur"));
  const [rows, settings] = await Promise.all([listInvoiceRows(done, kind), getSettings()]);

  const header = [
    "Tarih", "Tür", "Ad Soyad", "E-posta", "Şirket Unvanı", "Vergi Dairesi", "VKN/TCKN", "Adres",
    "Hizmet", "Matrah", "KDV Oranı", "KDV", "Toplam", "Fatura No", "Kayıt No",
  ];
  const lines = rows.map((r) => {
    const { base, vat } = splitVat(r.total, settings.vatPercent);
    return [
      dateFmt.format(r.date), INVOICE_KIND_LABEL[r.kind], r.customer.name, r.customer.email, r.customer.companyName,
      r.customer.taxOffice, r.customer.taxNumber, r.customer.address, r.service, base, `%${settings.vatPercent}`, vat,
      r.total, r.invoiceNo, `${r.kind}:${r.id}`,
    ].map(cell).join(";");
  });
  const csv = "﻿" + [header.join(";"), ...lines].join("\r\n");
  const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date());
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prosinta-faturalar-${done ? "kesilen" : "bekleyen"}-${stamp}.csv"`,
    },
  });
}
