import { Resend } from "resend";
import { formatPrice } from "@/lib/format-price";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "Prosinta <onboarding@resend.dev>";

/** Replies go somewhere a person reads, which also reads as legitimate to spam filters. */
const REPLY_TO = process.env.RESEND_REPLY_TO ?? "destek@prosinta.com";

/**
 * A readable plain-text version of the HTML body.
 *
 * An HTML-only message is one of the oldest spam signals there is: real senders offer
 * both parts and bulk senders often do not. Deriving the text from the same markup keeps
 * the two from drifting apart, which is its own signal when they disagree.
 *
 * Links are written out as "etiket: adres" because a text part that mentions a button
 * the reader cannot press is worse than no text part at all.
 */
function toPlainText(html: string) {
  return html
    // [\s\S] rather than the /s flag: the project targets an older ES level than /s needs.
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "$2: $1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|div|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8203;/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line, i, lines) => line !== "" || lines[i - 1] !== "")
    .join("\n")
    .trim();
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[email:mock] to=${to} subject="${subject}"`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text: toPlainText(html),
      replyTo: REPLY_TO,
    });
  } catch (error) {
    console.error("Failed to send email", error);
  }
}

function layout(title: string, body: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 20px; font-weight: 800; color: #12122b; margin-bottom: 24px;">Prosinta</p>
      <h1 style="font-size: 18px; color: #12122b;">${title}</h1>
      <div style="color: #475569; font-size: 14px; line-height: 1.6;">${body}</div>
      <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Bu e-posta Prosinta tarafından gönderilmiştir.</p>
    </div>
  `;
}

/**
 * The solid `background-color` comes first and the gradient after it.
 *
 * Outlook drops `linear-gradient` entirely. With only the gradient declared, the button
 * kept its white text on no background at all and disappeared — which is exactly what
 * the verification mail looked like on Outlook mobile. Clients that understand gradients
 * still paint one; the rest fall back to the solid purple.
 */
function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;padding:12px 26px;border-radius:999px;background-color:#9333ea;background:linear-gradient(135deg,#d946ef,#9333ea,#4f46e5);color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">${label}</a>`;
}

/** For free-text a buyer or seller typed themselves, dropped into the HTML body below. */
function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendWelcomeVerificationEmail(params: {
  to: string;
  name: string;
  verifyUrl: string;
}) {
  const html = layout(
    `Hoş geldin, ${params.name}!`,
    `<p>Prosinta'ya kayıt olduğun için teşekkürler. Hesabını aktifleştirmek için aşağıdaki butona tıkla.</p>
     ${button(params.verifyUrl, "E-postamı Doğrula")}
     <p style="margin-top:16px;">Buton çalışmazsa şu linki tarayıcına yapıştır:<br/>${params.verifyUrl}</p>`
  );
  await sendEmail(params.to, "Prosinta'ya hoş geldin — hesabını doğrula", html);
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const html = layout(
    "Şifreni sıfırla",
    `<p>Merhaba ${params.name}, Prosinta hesabın için şifre sıfırlama isteği aldık.
      Aşağıdaki butondan yeni şifreni belirleyebilirsin. Bağlantı <strong>1 saat</strong> geçerli.</p>
     ${button(params.resetUrl, "Yeni Şifre Belirle")}
     <p style="margin-top:16px;">Buton çalışmazsa şu linki tarayıcına yapıştır:<br/>${params.resetUrl}</p>
     <p style="margin-top:16px;">Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin;
      şifren değişmeden kalır.</p>`
  );
  await sendEmail(params.to, "Prosinta şifre sıfırlama", html);
}

export async function sendOrderPaidEmails(params: {
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  sellerName: string;
  gigTitle: string;
  /** Package price — what the seller sees. */
  amount: number;
  /** What the buyer actually paid (after any first-order discount). */
  paidAmount: number;
  orderUrl: string;
}) {
  await sendEmail(
    params.buyerEmail,
    "Ödemen alındı",
    layout(
      "Ödemen başarıyla alındı",
      `<p>Merhaba ${params.buyerName},</p>
       <p><strong>${params.gigTitle}</strong> için <strong>${formatPrice(params.paidAmount)} TL</strong> tutarındaki ödemen alındı. Satıcı işe başladığında haber vereceğiz.</p>
       ${button(params.orderUrl, "Siparişi Görüntüle")}`
    )
  );

  await sendEmail(
    params.sellerEmail,
    "Yeni bir siparişin var",
    layout(
      "Yeni sipariş!",
      `<p>Merhaba ${params.sellerName},</p>
       <p><strong>${params.gigTitle}</strong> ilanın için yeni bir sipariş aldın (${formatPrice(params.amount)} TL). İşe başlamak için siparişi onayla.</p>
       ${button(params.orderUrl, "Siparişi Görüntüle")}`
    )
  );
}

export async function sendBankTransferAdminAlertEmail(params: {
  adminEmail: string;
  buyerName: string;
  gigTitle: string;
  amount: number;
  orderUrl: string;
}) {
  await sendEmail(
    params.adminEmail,
    "Havale/EFT ödeme bildirimi — onay bekleniyor",
    layout(
      "Ödeme onayı bekleniyor",
      `<p><strong>${params.buyerName}</strong>, <strong>${params.gigTitle}</strong> siparişi için <strong>${formatPrice(params.amount)} TL</strong> tutarında havale/EFT yaptığını bildirdi. Şirket hesabını kontrol edip ödemeyi onayla.</p>
       ${button(params.orderUrl, "Ödemeyi Onayla")}`
    )
  );
}

export async function sendBankTransferSellerInfoEmail(params: {
  sellerEmail: string;
  sellerName: string;
  gigTitle: string;
  orderUrl: string;
}) {
  await sendEmail(
    params.sellerEmail,
    "Ödeme onayı bekleniyor",
    layout(
      "Sipariş için ödeme bildirildi",
      `<p>Merhaba ${params.sellerName},</p>
       <p><strong>${params.gigTitle}</strong> siparişi için alıcı havale/EFT ile ödeme yaptığını bildirdi. Ödeme Prosinta ekibi tarafından kontrol ediliyor, onaylandığında sana haber vereceğiz.</p>
       ${button(params.orderUrl, "Siparişi Görüntüle")}`
    )
  );
}

export async function sendOrderStartedEmail(params: {
  buyerEmail: string;
  buyerName: string;
  gigTitle: string;
  orderUrl: string;
}) {
  await sendEmail(
    params.buyerEmail,
    "Satıcı işe başladı",
    layout(
      "İşe başlandı",
      `<p>Merhaba ${params.buyerName},</p>
       <p><strong>${params.gigTitle}</strong> siparişin üzerinde satıcı çalışmaya başladı.</p>
       ${button(params.orderUrl, "Siparişi Görüntüle")}`
    )
  );
}

export async function sendOrderDeliveredEmail(params: {
  buyerEmail: string;
  buyerName: string;
  gigTitle: string;
  orderUrl: string;
}) {
  await sendEmail(
    params.buyerEmail,
    "Siparişin teslim edildi",
    layout(
      "Teslimat hazır",
      `<p>Merhaba ${params.buyerName},</p>
       <p><strong>${params.gigTitle}</strong> siparişin teslim edildi. İncele ve onaylarsan ödeme satıcıya aktarılır.</p>
       ${button(params.orderUrl, "Teslimatı İncele")}`
    )
  );
}

export async function sendOrderCompletedEmail(params: {
  sellerEmail: string;
  sellerName: string;
  gigTitle: string;
  amount: number;
  orderUrl: string;
}) {
  await sendEmail(
    params.sellerEmail,
    "Ödemen serbest bırakıldı",
    layout(
      "Ödeme aktarıldı",
      `<p>Merhaba ${params.sellerName},</p>
       <p><strong>${params.gigTitle}</strong> siparişi alıcı tarafından onaylandı, <strong>${formatPrice(params.amount)} TL</strong> tutarındaki ödeme sana aktarıldı.</p>
       ${button(params.orderUrl, "Siparişi Görüntüle")}`
    )
  );
}

/** To the admin: a paid order's buyer wants out. Per the site's own iptal/iade policy,
 * anything past PENDING_PAYMENT is handled by support rather than an automatic refund. */
export async function sendCancellationRequestEmail(params: {
  adminEmail: string;
  buyerName: string;
  gigTitle: string;
  amount: number;
  orderUrl: string;
}) {
  await sendEmail(
    params.adminEmail,
    "Sipariş iptal talebi",
    layout(
      "İptal talebi geldi",
      `<p><strong>${params.buyerName}</strong>, ödemesi tamamlanmış <strong>${params.gigTitle}</strong> siparişi (${formatPrice(params.amount)} TL) için iptal talep etti. Satıcı henüz işe başlamadıysa iade sürecini destek@prosinta.com üzerinden yürüt.</p>
       ${button(params.orderUrl, "Siparişi Görüntüle")}`
    )
  );
}

export async function sendCancellationRequestReceivedEmail(params: {
  buyerEmail: string;
  buyerName: string;
  gigTitle: string;
}) {
  await sendEmail(
    params.buyerEmail,
    "İptal talebin alındı",
    layout(
      "İptal talebin alındı",
      `<p>Merhaba ${params.buyerName},</p>
       <p><strong>${params.gigTitle}</strong> siparişin için ilettiğin iptal talebi ekibimize ulaştı. Destek ekibimiz talebini inceleyip kısa süre içinde seninle iletişime geçecek.</p>`
    )
  );
}

/** To the seller: the buyer didn't accept the delivery and wants changes instead. */
export async function sendRevisionRequestedEmail(params: {
  sellerEmail: string;
  sellerName: string;
  gigTitle: string;
  note: string;
  orderUrl: string;
}) {
  await sendEmail(
    params.sellerEmail,
    "Alıcı revizyon istedi",
    layout(
      "Revizyon talebi",
      `<p>Merhaba ${params.sellerName},</p>
       <p><strong>${params.gigTitle}</strong> siparişinde alıcı teslimatı onaylamak yerine revizyon istedi:</p>
       <p style="background:#f8fafc;border-radius:12px;padding:12px 16px;">${escapeHtml(params.note)}</p>
       ${button(params.orderUrl, "Siparişi Görüntüle")}`
    )
  );
}

export async function sendNewMessageEmail(params: {
  to: string;
  recipientName: string;
  senderName: string;
  preview: string;
  threadUrl: string;
}) {
  const preview = params.preview.length > 200 ? `${params.preview.slice(0, 200)}…` : params.preview;
  await sendEmail(
    params.to,
    `${params.senderName} sana mesaj gönderdi`,
    layout(
      "Yeni mesajın var",
      `<p>Merhaba ${escapeHtml(params.recipientName)},</p>
       <p><strong>${escapeHtml(params.senderName)}</strong> Prosinta'da sana mesaj gönderdi:</p>
       <p style="background:#f8fafc;border-radius:12px;padding:12px 16px;">${escapeHtml(preview)}</p>
       ${button(params.threadUrl, "Mesajı Yanıtla")}
       <p style="font-size:12px;color:#94a3b8;">Güvenliğin için ödemeleri ve iletişimi Prosinta üzerinden yürüt.</p>`
    )
  );
}

export async function sendFounderWelcomeEmail(params: {
  to: string;
  name: string;
  profileUrl: string;
}) {
  await sendEmail(
    params.to,
    "Tebrikler, Kurucu Freelancer oldun",
    layout(
      "Kurucu Freelancer oldun",
      `<p>Merhaba ${escapeHtml(params.name)},</p>
       <p>İlk ilanın yayına alındı ve Prosinta'nın ilk freelancer'ları arasına girdin: artık bir <strong>Kurucu Freelancer</strong>'sın.</p>
       <p>Profilinde ve ilanlarında kalıcı Kurucu rozeti görünecek, ilanların arama sonuçlarında öne çıkacak.</p>
       ${button(params.profileUrl, "Profilimi Gör")}`
    )
  );
}

export async function sendReferralRewardEmail(params: {
  to: string;
  name: string;
  friendName: string;
  amount: number;
  inviteUrl: string;
}) {
  await sendEmail(
    params.to,
    `Davet ödülün hazır: ${formatPrice(params.amount)} TL`,
    layout(
      "Davet ödülün hazır",
      `<p>Merhaba ${escapeHtml(params.name)},</p>
       <p>Davet ettiğin <strong>${escapeHtml(params.friendName)}</strong> Prosinta'daki ilk siparişini tamamladı. Teşekkürler!</p>
       <p><strong>${formatPrice(params.amount)} TL</strong> davet ödülün tanımlandı; bu tutardan yüksek bir sonraki siparişinde ödeme sayfasında otomatik düşülecek.</p>
       ${button(params.inviteUrl, "Davetlerimi Gör")}`
    )
  );
}

export async function sendMembershipEndingEmail(params: {
  to: string;
  name: string;
  planLabel: string;
  until: string;
  trial: boolean;
  renewUrl: string;
  /** A corporate plan: different perks are lost, and it is a "paket" rather than an "üyelik". */
  corporate?: boolean;
}) {
  const what = params.trial
    ? `Ücretsiz ${params.planLabel} denemen`
    : params.corporate
      ? `${params.planLabel} paketin`
      : `${params.planLabel} üyeliğin`;
  const loses = params.corporate
    ? "Sonrasında sipariş indirimin ve bakiye bonusun sona erer; bakiyen ve geçmişin korunur."
    : "Sonrasında rozetin, aramalardaki önceliğin ve aylık ücretsiz Öne Çıkar hakkın kalkar; ilanların yayında kalmaya devam eder.";
  await sendEmail(
    params.to,
    `${what} ${params.until} tarihinde bitiyor`,
    layout(
      `${what} bitiyor`,
      `<p>Merhaba ${escapeHtml(params.name)},</p>
       <p>${what} <strong>${params.until}</strong> tarihinde sona erecek. ${loses}</p>
       <p>Kesintisiz devam etmek için şimdi yenileyebilirsin. Yıllık planda daha az ödersin.</p>
       ${button(params.renewUrl, params.corporate ? "Paketimi Yenile" : "Üyeliğimi Yenile")}`
    )
  );
}

export type CampaignAnnouncement = {
  name: string;
  tagline: string | null;
  start: string;
  end: string;
  minPercent: number;
  maxPercent: number;
  proDiscountPercent: number;
  boostDiscountPercent: number;
  joinUrl: string;
};

/** The announcement body for one freelancer (exported for previews). */
export function campaignAnnouncementHtml(campaign: CampaignAnnouncement, name: string, unsubscribeUrl: string): string {
  const perks = [
    campaign.proDiscountPercent > 0 ? `Pro üyelikte %${campaign.proDiscountPercent}` : null,
    campaign.boostDiscountPercent > 0 ? `Öne Çıkar'da %${campaign.boostDiscountPercent}` : null,
  ].filter(Boolean);
  return layout(
    `${escapeHtml(campaign.name)} geliyor`,
    `<p>Merhaba ${escapeHtml(name)},</p>
     ${campaign.tagline ? `<p>${escapeHtml(campaign.tagline)}</p>` : ""}
     <p><strong>${campaign.start} – ${campaign.end}</strong> tarihleri arasında alıcılar kampanyaya katılan ilanları indirimli görecek.</p>
     <p>İlanlarını <strong>%${campaign.minPercent}–%${campaign.maxPercent}</strong> arasında dilediğin indirimle kampanyaya ekleyebilirsin; indirimi sen seçersin, istediğin zaman değiştirebilir ya da çıkarabilirsin.</p>
     ${perks.length > 0 ? `<p>Kampanya süresince ${perks.join(", ")} indirim de seni bekliyor.</p>` : ""}
     ${button(campaign.joinUrl, "Kampanyaya Katıl")}
     <p style="margin-top:28px;font-size:12px;color:#94a3b8;">Bu e-postayı Prosinta freelancer hesabın olduğu için aldın. <a href="${unsubscribeUrl}" style="color:#94a3b8;">Kampanya duyurularını almak istemiyorum</a></p>`
  );
}

/**
 * One campaign announcement to many freelancers, in batches of 100 (Resend's limit per
 * call). Each message carries its own unsubscribe link and List-Unsubscribe headers,
 * which bulk mail needs to reach the inbox. Returns how many were handed to Resend.
 */
export async function sendCampaignAnnouncementEmails(
  campaign: CampaignAnnouncement,
  recipients: { email: string; name: string; unsubscribeUrl: string; oneClickUrl: string }[]
): Promise<number> {
  const subject = `${campaign.name}: ilanlarını kampanyaya ekle`;
  const messages = recipients.map((r) => {
    const html = campaignAnnouncementHtml(campaign, r.name, r.unsubscribeUrl);
    return {
      from: FROM,
      to: r.email,
      subject,
      html,
      text: toPlainText(html),
      replyTo: REPLY_TO,
      headers: {
        "List-Unsubscribe": `<${r.oneClickUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  });

  if (!resend) {
    console.log(`[email:mock] campaign="${campaign.name}" recipients=${messages.length}`);
    return messages.length;
  }

  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const { error } = await resend.batch.send(chunk);
      if (error) console.error("Campaign announcement batch failed", error);
      else sent += chunk.length;
    } catch (error) {
      console.error("Campaign announcement batch failed", error);
    }
  }
  return sent;
}
