"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { readWorkbookRows, findColumn, parseAmount, parseRowDate, cellString } from "@/lib/xlsx-import";

// Matches SYNTHETIC_PASSWORD_HASH in prisma/synthetic-freelancers.ts — not imported from
// there to avoid pulling that module's profession/city data tables into this route's
// bundle for the sake of one string.
const SHOWCASE_PASSWORD_HASH = "!showcase-profile-no-login";

export type ImportResult = {
  error?: string;
  added?: number;
  failed?: { row: number; reason: string }[];
};

const NAME_COLUMNS = ["Alıcı Adı", "Alıcı", "Ad Soyad", "Müşteri", "Müşteri Adı"];
const AMOUNT_COLUMNS = ["Tutar", "Ücret", "Ödeme", "Tutar (₺)", "Miktar"];
const DATE_COLUMNS = ["Tarih", "Ödeme Tarihi", "Tarihi"];
const STATUS_COLUMNS = ["Durum", "Onay Durumu", "Status"];

const APPROVED_WORDS = ["onay", "approved", "paid", "odendi", "ödendi"];

function isApproved(raw: unknown): boolean {
  const text = cellString(raw).toLocaleLowerCase("tr-TR");
  return APPROVED_WORDS.some((w) => text.includes(w));
}

/** ASCII, e-mail-safe form of a name — mirrors the app's other slugify helpers. */
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Reads an uploaded .xlsx and writes one havale/EFT order (+ its payment record) per
 * spreadsheet row — the same shape yesterday's hand-written migrations produced, but as a
 * repeatable admin action instead of a one-off script.
 *
 * Every order needs a gig and a package to point at (the schema requires both); since the
 * sheet only describes a payment, not a specific purchase, each row is assigned one of the
 * marketplace's own published gigs round-robin, and its amount is whatever the sheet says
 * rather than that gig's own listed price — Order.amount is stored independently for
 * exactly this reason (a price can change after the sale).
 *
 * A buyer name that already exists (case-insensitive) is reused; one that does not is
 * created as a new, unable-to-log-in buyer account, the same way earlier bulk imports did.
 */
export async function importBankTransfersAction(
  _prevState: ImportResult,
  formData: FormData
): Promise<ImportResult> {
  await requireAdmin();

  const file = formData.get("dosya");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Bir Excel dosyası seç" };
  }

  let rows;
  try {
    rows = await readWorkbookRows(file);
  } catch {
    return { error: "Dosya okunamadı — geçerli bir .xlsx olduğundan emin ol" };
  }
  if (rows.length === 0) return { error: "Dosyada okunacak satır bulunamadı" };

  const pool = await prisma.gig.findMany({
    where: { published: true, packages: { some: {} } },
    select: { id: true, packages: { orderBy: { price: "asc" }, take: 1, select: { id: true } } },
  });
  if (pool.length === 0) {
    return { error: "Sipariş bağlanacak yayında bir ilan yok" };
  }

  const now = new Date();
  const failed: { row: number; reason: string }[] = [];
  let added = 0;
  let poolIndex = 0;

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const rowNumber = index + 2;

    const name = cellString(findColumn(row, NAME_COLUMNS));
    const amount = parseAmount(findColumn(row, AMOUNT_COLUMNS));
    const createdAt = parseRowDate(findColumn(row, DATE_COLUMNS), now);
    const approved = isApproved(findColumn(row, STATUS_COLUMNS));

    if (!name) {
      failed.push({ row: rowNumber, reason: "Alıcı Adı boş" });
      continue;
    }
    if (amount === null) {
      failed.push({ row: rowNumber, reason: "Tutar okunamadı" });
      continue;
    }

    let buyer = await prisma.user.findFirst({
      where: { role: "BUYER", name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (!buyer) {
      buyer = await prisma.user.create({
        data: {
          name,
          email: `${slugify(name)}-${randomUUID().slice(0, 8)}@demo.prosinta.com`,
          role: "BUYER",
          synthetic: true,
          passwordHash: SHOWCASE_PASSWORD_HASH,
          emailVerified: now,
        },
        select: { id: true },
      });
    }

    const target = pool[poolIndex % pool.length];
    poolIndex += 1;
    const status = approved ? "PAID" : "PENDING_VERIFICATION";

    const order = await prisma.order.create({
      data: {
        status,
        amount,
        buyerId: buyer.id,
        gigId: target.id,
        packageId: target.packages[0].id,
        createdAt,
        updatedAt: createdAt,
      },
      select: { id: true },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "havale",
        status: approved ? "SUCCESS" : "INITIALIZED",
        conversationId: randomUUID(),
        rawResponse: { mode: "havale", imported: true },
      },
    });

    added += 1;
  }

  revalidatePath("/admin/havale-onaylari");
  revalidatePath("/admin/siparisler");
  revalidatePath("/admin");
  return { added, failed };
}
