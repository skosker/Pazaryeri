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

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;padding:10px 24px;border-radius:999px;background:linear-gradient(135deg,#d946ef,#9333ea,#4f46e5);color:#fff;text-decoration:none;font-weight:600;font-size:14px;">${label}</a>`;
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
  amount: number;
  orderUrl: string;
}) {
  await sendEmail(
    params.buyerEmail,
    "Ödemen alındı",
    layout(
      "Ödemen başarıyla alındı",
      `<p>Merhaba ${params.buyerName},</p>
       <p><strong>${params.gigTitle}</strong> için <strong>${formatPrice(params.amount)}₺</strong> tutarındaki ödemen alındı. Satıcı işe başladığında haber vereceğiz.</p>
       ${button(params.orderUrl, "Siparişi Görüntüle")}`
    )
  );

  await sendEmail(
    params.sellerEmail,
    "Yeni bir siparişin var",
    layout(
      "Yeni sipariş!",
      `<p>Merhaba ${params.sellerName},</p>
       <p><strong>${params.gigTitle}</strong> ilanın için yeni bir sipariş aldın (${formatPrice(params.amount)}₺). İşe başlamak için siparişi onayla.</p>
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
      `<p><strong>${params.buyerName}</strong>, <strong>${params.gigTitle}</strong> siparişi için <strong>${formatPrice(params.amount)}₺</strong> tutarında havale/EFT yaptığını bildirdi. Şirket hesabını kontrol edip ödemeyi onayla.</p>
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
       <p><strong>${params.gigTitle}</strong> siparişi alıcı tarafından onaylandı, <strong>${formatPrice(params.amount)}₺</strong> tutarındaki ödeme sana aktarıldı.</p>
       ${button(params.orderUrl, "Siparişi Görüntüle")}`
    )
  );
}
