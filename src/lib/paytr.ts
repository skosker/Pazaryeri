import crypto from "crypto";

/**
 * PayTR iFrame API. No SDK — it's a plain form-encoded REST call plus an HMAC-SHA256
 * hash PayTR uses to authenticate both the token request and the async notification
 * that confirms payment (see verifyPaytrNotification). Docs: https://dev.paytr.com/
 */

export const isMockPayment =
  !process.env.PAYTR_MERCHANT_ID ||
  !process.env.PAYTR_MERCHANT_KEY ||
  !process.env.PAYTR_MERCHANT_SALT ||
  process.env.PAYTR_MERCHANT_ID === "sandbox-mock";

/** "1" drives PayTR's own test rails (no real bank settlement); "0" is live money. */
function testMode() {
  return process.env.PAYTR_TEST_MODE === "0" ? "0" : "1";
}

type BasketItem = { name: string; price: number; quantity: number };

type GetTokenParams = {
  merchantOid: string;
  email: string;
  amount: number; // TL
  userIp: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  basket: BasketItem[];
  okUrl: string;
  failUrl: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} tanımlı değil`);
  return value;
}

/**
 * Starts a checkout: asks PayTR for an iframe token. Throws if PayTR rejects the
 * request (bad hash, bad merchant credentials, malformed basket, …) — the caller
 * decides how to surface that to the buyer.
 */
export async function getPaytrToken(params: GetTokenParams): Promise<string> {
  const merchantId = requireEnv("PAYTR_MERCHANT_ID");
  const merchantKey = requireEnv("PAYTR_MERCHANT_KEY");
  const merchantSalt = requireEnv("PAYTR_MERCHANT_SALT");
  const mode = testMode();

  // Kuruş, not TL — PayTR's amount fields are always the smallest currency unit.
  const paymentAmount = Math.round(params.amount * 100);
  const userBasket = Buffer.from(
    JSON.stringify(params.basket.map((item) => [item.name, item.price.toFixed(2), item.quantity]))
  ).toString("base64");
  const noInstallment = "0";
  const maxInstallment = "0";
  const currency = "TL";

  // Field order here is fixed by PayTR's spec — it is not "any order, as long as it's
  // consistent"; changing it produces a hash PayTR's own recomputation won't match.
  const hashStr =
    merchantId +
    params.userIp +
    params.merchantOid +
    params.email +
    paymentAmount +
    userBasket +
    noInstallment +
    maxInstallment +
    currency +
    mode;

  const paytrToken = crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64");

  const body = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: params.userIp,
    merchant_oid: params.merchantOid,
    email: params.email,
    payment_amount: String(paymentAmount),
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: "0",
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: params.userName,
    user_address: params.userAddress,
    user_phone: params.userPhone,
    merchant_ok_url: params.okUrl,
    merchant_fail_url: params.failUrl,
    timeout_limit: "30",
    currency,
    test_mode: mode,
    lang: "tr",
  });

  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await response.json()) as { status: string; token?: string; reason?: string };
  if (data.status !== "success" || !data.token) {
    throw new Error(`PayTR token alınamadı: ${data.reason ?? "bilinmeyen hata"}`);
  }
  return data.token;
}

export type PaytrNotification = {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: string;
};

/**
 * PayTR's async "bildirim" (notification) POST is the only source of truth for whether
 * money actually moved — merchant_ok_url/merchant_fail_url are just where the buyer's
 * browser gets redirected and can't be trusted (anyone can request either URL by hand).
 * This must pass before an order is ever marked paid from this callback.
 */
export function verifyPaytrNotification(fields: PaytrNotification): boolean {
  const merchantKey = requireEnv("PAYTR_MERCHANT_KEY");
  const merchantSalt = requireEnv("PAYTR_MERCHANT_SALT");
  const hashStr = `${fields.merchant_oid}${merchantSalt}${fields.status}${fields.total_amount}`;
  const expected = crypto.createHmac("sha256", merchantKey).update(hashStr).digest("base64");
  return expected === fields.hash;
}
