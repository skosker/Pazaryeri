import { prisma } from "@/lib/prisma";
import { TEST_EMAIL_DOMAIN } from "@/lib/test-accounts";
import { REFUND_REASONS, type RefundReason } from "@/lib/refund-labels";
import { requestRefund } from "@/lib/refunds";

/**
 * Example refund requests for the bulk-opened test accounts, made through the member's own
 * request code (requestRefund) so Admin → Üyelik İadeleri and Faturalarım show them as a
 * member's. Each paid membership purchase without a refund gets one request, with reasons
 * and notes taken in turn; a bank-transfer purchase carries a test IBAN as the form asks.
 * A purchase that already has a refund record is left alone, so running it twice adds nothing.
 */

const TEST_IBAN = "TR330006100519786457841326";

const NOTES: Record<RefundReason, string[]> = {
  MUKERRER: [
    "Aynı paketi yanlışlıkla iki kez ödedim; ikinci ödemenin iadesini istiyorum.",
    "Havale bildirimini iki kez gönderdim, mükerrer tahsilatın iadesini talep ediyorum.",
  ],
  HATALI_TAHSILAT: [
    "Aylık paket seçtim ancak yıllık tutar çekilmiş görünüyor, farkın iadesini istiyorum.",
    "Ödeme tutarı ekranda gördüğüm fiyattan farklı alınmış, düzeltilmesini rica ediyorum.",
  ],
  HIZMET_SUNULAMADI: [
    "Üyelik onaylandı ancak Pro özellikleri hesabımda aktif olmadı, iki gündür kullanamıyorum.",
    "Öne çıkan ilan hakkım tanımlanmadı; paketin sunulmadığını düşünüyorum.",
  ],
  DIGER: [
    "Paketi artık kullanmayacağım, ilk günde vazgeçtim; iade mümkün mü?",
    "Yanlış hesapla satın aldım, paketin asıl hesabıma tanımlanmasını bekliyordum.",
  ],
};

export async function createSampleRefundRequests(limit = 20) {
  const purchases = await prisma.proPurchase.findMany({
    where: {
      status: "SUCCESS",
      amount: { gt: 0 },
      refund: null,
      user: { isTester: true, suspended: false, email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } },
    },
    select: { id: true, provider: true, userId: true, user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  const reasons = Object.keys(REFUND_REASONS) as RefundReason[];
  let created = 0;
  for (const [i, p] of purchases.entries()) {
    const reason = reasons[i % reasons.length];
    const notes = NOTES[reason];
    const bank = p.provider === "havale";
    await requestRefund({
      userId: p.userId,
      purchaseId: p.id,
      reason,
      note: notes[Math.floor(i / reasons.length) % notes.length],
      iban: bank ? TEST_IBAN : null,
      ibanHolder: bank ? p.user.name : null,
    });
    created++;
  }
  return { created };
}
