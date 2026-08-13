import type { PackageTier } from "@/generated/prisma/client";

/** Maps the flat `basicPrice`, `standardDeliveryDays`, ... form fields onto gigSchema's shape. */
export function readGigForm(formData: FormData) {
  const tier = (key: string) => ({
    price: formData.get(`${key}Price`),
    deliveryDays: formData.get(`${key}DeliveryDays`),
    revisionCount: formData.get(`${key}RevisionCount`),
    description: formData.get(`${key}Description`),
  });

  return {
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    basic: tier("basic"),
    standard: tier("standard"),
    premium: tier("premium"),
  };
}

export type TierInput = {
  price: number;
  deliveryDays: number;
  revisionCount: number;
  description: string;
};

const tierNames: Record<PackageTier, string> = {
  BASIC: "Temel Paket",
  STANDARD: "Standart Paket",
  PREMIUM: "Premium Paket",
};

const extraFeatures: Record<PackageTier, string[]> = {
  BASIC: ["Temel kapsam"],
  STANDARD: ["Kaynak dosyalar dahil"],
  PREMIUM: ["Kaynak dosyalar dahil", "Ticari kullanım lisansı", "Öncelikli teslimat"],
};

export function packageData(tier: PackageTier, values: TierInput) {
  return {
    tier,
    name: tierNames[tier],
    description: values.description,
    price: values.price,
    deliveryDays: values.deliveryDays,
    revisionCount: values.revisionCount,
    features: [...extraFeatures[tier], `${values.revisionCount} revizyon hakkı`],
  };
}
