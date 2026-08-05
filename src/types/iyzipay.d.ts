declare module "iyzipay" {
  type IyzipayCallback = (err: unknown, result: Record<string, unknown>) => void;

  interface IyzipayResourceMethods {
    create: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    retrieve: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
  }

  class Iyzipay {
    constructor(config: { apiKey: string; secretKey: string; uri: string });
    checkoutFormInitialize: IyzipayResourceMethods;
    checkoutForm: IyzipayResourceMethods;

    static LOCALE: { TR: string; EN: string };
    static CURRENCY: { TRY: string; [key: string]: string };
    static PAYMENT_GROUP: { PRODUCT: string; LISTING: string; SUBSCRIPTION: string };
    static BASKET_ITEM_TYPE: { PHYSICAL: string; VIRTUAL: string };
  }

  export = Iyzipay;
}
