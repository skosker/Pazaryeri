import Iyzipay from "iyzipay";

export const isMockPayment =
  !process.env.IYZICO_API_KEY ||
  !process.env.IYZICO_SECRET_KEY ||
  process.env.IYZICO_API_KEY === "sandbox-mock";

let client: Iyzipay | null = null;

export function getIyzicoClient() {
  if (isMockPayment) {
    throw new Error("iyzico mock modundayken gerçek istemci kullanılamaz");
  }
  if (!client) {
    client = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
    });
  }
  return client;
}

type CheckoutFormInitParams = {
  conversationId: string;
  price: number;
  basketId: string;
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    ip: string;
  };
  item: {
    id: string;
    name: string;
    category: string;
  };
};

export function initializeCheckoutForm(
  params: CheckoutFormInitParams
): Promise<Record<string, unknown>> {
  const iyzipay = getIyzicoClient();

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: params.conversationId,
    price: params.price.toFixed(2),
    paidPrice: params.price.toFixed(2),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: params.basketId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1, 2, 3],
    buyer: {
      id: params.buyer.id,
      name: params.buyer.name,
      surname: params.buyer.surname || params.buyer.name,
      gsmNumber: "+905000000000",
      email: params.buyer.email,
      identityNumber: "11111111111",
      registrationAddress: "Profestia, Türkiye",
      ip: params.buyer.ip,
      city: "Istanbul",
      country: "Turkey",
      zipCode: "34000",
    },
    shippingAddress: {
      contactName: params.buyer.name,
      city: "Istanbul",
      country: "Turkey",
      address: "Dijital Hizmet",
      zipCode: "34000",
    },
    billingAddress: {
      contactName: params.buyer.name,
      city: "Istanbul",
      country: "Turkey",
      address: "Dijital Hizmet",
      zipCode: "34000",
    },
    basketItems: [
      {
        id: params.item.id,
        name: params.item.name,
        category1: params.item.category,
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: params.price.toFixed(2),
      },
    ],
  };

  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err) return reject(err);
      resolve(result as Record<string, unknown>);
    });
  });
}

export function retrieveCheckoutForm(
  token: string,
  conversationId: string
): Promise<Record<string, unknown>> {
  const iyzipay = getIyzicoClient();

  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(
      { locale: Iyzipay.LOCALE.TR, token, conversationId },
      (err, result) => {
        if (err) return reject(err);
        resolve(result as Record<string, unknown>);
      }
    );
  });
}
