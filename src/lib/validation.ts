import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ad Soyad en az 2 karakter olmalı"),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  role: z.enum(["BUYER", "FREELANCER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const gigSchema = z.object({
  title: z.string().trim().min(10, "Başlık en az 10 karakter olmalı").max(100),
  description: z.string().trim().min(30, "Açıklama en az 30 karakter olmalı"),
  categoryId: z.string().min(1, "Kategori seçin"),
  price: z.coerce.number().positive("Fiyat 0'dan büyük olmalı"),
  deliveryDays: z.coerce.number().int().positive("Teslim süresi 0'dan büyük olmalı"),
  revisionCount: z.coerce.number().int().min(0).default(2),
  packageDescription: z.string().trim().min(10, "Paket açıklaması en az 10 karakter olmalı"),
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
