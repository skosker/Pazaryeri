import { NextResponse } from "next/server";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { invoiceOwnerId, parseInvoiceKind } from "@/lib/invoices";

/** The e-Arşiv PDF of one invoice: to the member it was issued to, or an admin. */
export async function GET(_request: Request, ctx: RouteContext<"/panel/faturalarim/pdf/[kind]/[id]">) {
  const { kind, id } = await ctx.params;
  const user = await activeUser();
  if (!user) return new NextResponse("Giriş yapmalısın", { status: 401 });

  const invoiceKind = parseInvoiceKind(kind);
  if (!invoiceKind) return new NextResponse("Bulunamadı", { status: 404 });
  if (user.role !== "ADMIN" && (await invoiceOwnerId(invoiceKind, id)) !== user.id) {
    return new NextResponse("Bulunamadı", { status: 404 });
  }

  const file = await prisma.invoiceFile.findUnique({ where: { kind_recordId: { kind: invoiceKind, recordId: id } } });
  if (!file) return new NextResponse("Bulunamadı", { status: 404 });

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="prosinta-fatura-${id.slice(-8)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
