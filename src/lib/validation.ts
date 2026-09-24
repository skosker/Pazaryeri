import { z } from "zod";
import { isValidTaxNumber } from "@/lib/tax-number";

/** One rule for every place a password is set, so they cannot drift apart. */
const password = z
  .string()
  .min(6, "Şifre en az 6 karakter olmalı")
  .regex(/[a-z]/, "Şifre en az bir küçük harf içermeli")
  .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
  .regex(/[0-9]/, "Şifre en az bir rakam içermeli");

/**
 * Kurumsal fatura bilgileri. All four are required together: a company account without
 * a tax number cannot be invoiced.
 */
export const companySchema = z.object({
  companyName: z.string().trim().min(2, "Şirket unvanını gir").max(200),
  taxOffice: z.string().trim().min(2, "Vergi dairesini gir").max(100),
  taxNumber: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .refine(isValidTaxNumber, "Vergi numarası geçersiz (10 haneli VKN ya da şahıs şirketi için 11 haneli TCKN)"),
  billingAddress: z.string().trim().min(10, "Fatura adresini gir").max(500),
});

export type CompanyInput = z.infer<typeof companySchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ad Soyad en az 2 karakter olmalı"),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin"),
  password,
  role: z.enum(["BUYER", "FREELANCER"]),
  acceptedTerms: z.boolean().refine((v) => v === true, {
    message: "Üyelik Sözleşmesi'ni ve Kullanım Şartları'nı onaylamalısın",
  }),
  /** Only for a buyer who picked "Kurumsal" at signup. */
  company: companySchema.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Sıfırlama bağlantısı eksik"),
    password,
    passwordAgain: z.string(),
  })
  .refine((v) => v.password === v.passwordAgain, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordAgain"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifreni gir"),
    password,
    passwordAgain: z.string(),
  })
  .refine((v) => v.password === v.passwordAgain, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordAgain"],
  });

const tierFields = (label: string) => ({
  price: z.coerce.number().positive(`${label} paketin fiyatı 0'dan büyük olmalı`),
  deliveryDays: z.coerce.number().int().positive(`${label} paketin teslim süresi 0'dan büyük olmalı`),
  revisionCount: z.coerce.number().int().min(0).default(2),
  description: z.string().trim().min(10, `${label} paket açıklaması en az 10 karakter olmalı`),
});

export const gigSchema = z
  .object({
    title: z.string().trim().min(10, "Başlık en az 10 karakter olmalı").max(100),
    description: z.string().trim().min(30, "Açıklama en az 30 karakter olmalı"),
    categoryId: z.string().min(1, "Kategori seçin"),
    basic: z.object(tierFields("Temel")),
    standard: z.object(tierFields("Standart")),
    premium: z.object(tierFields("Premium")),
  })
  .refine((v) => v.basic.price < v.standard.price && v.standard.price < v.premium.price, {
    message: "Fiyatlar Temel < Standart < Premium sırasında artmalı",
    path: ["standard", "price"],
  });

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Yorum en az 5 karakter olmalı"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Ad Soyad en az 2 karakter olmalı").max(60),
  title: z.string().trim().max(80).optional().or(z.literal("")),
  bio: z.string().trim().max(600).optional().or(z.literal("")),
});

export const becomeFreelancerSchema = z.object({
  title: z.string().trim().min(2, "Unvan en az 2 karakter olmalı").max(80),
  bio: z.string().trim().max(600).optional().or(z.literal("")),
});
