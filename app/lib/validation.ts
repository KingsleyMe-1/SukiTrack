import { z } from "zod";

const stockStatusSchema = z.enum(["in-stock", "low-stock", "out-of-stock"]);

export const priceEntrySchema = z.object({
  date: z.string().min(1),
  price: z.number().finite().nonnegative(),
});

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Product name is required."),
  category: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  currentPrice: z.number().finite().positive("Current price must be greater than 0."),
  targetPrice: z.number().finite().positive().optional(),
  stockStatus: stockStatusSchema,
  stockCount: z.number().int().nonnegative().optional(),
  priceHistory: z.array(priceEntrySchema),
  imageUrl: z.string().url().optional(),
  isPromo: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  addedDate: z.string().min(1),
  weeklyUnitsSold: z.number().int().nonnegative().optional(),
  storeOwnerId: z.string().optional(),
});

export const storeUserAccountSchema = z.object({
  id: z.string().min(1),
  email: z.string().trim().email("Please use a valid email address."),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  storeName: z.string().trim().min(2, "Store name must be at least 2 characters."),
  passwordHash: z.string().min(1),
  passwordSalt: z.string().min(1),
  passwordIterations: z.number().int().positive(),
  createdAt: z.string().min(1),
});

export const customerAccountSchema = z.object({
  id: z.string().min(1),
  email: z.string().trim().email("Please use a valid email address."),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  createdAt: z.string().min(1),
});

export const storeOwnerSignupInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please use a valid email address."),
  storeName: z.string().trim().min(2, "Store name must be at least 2 characters."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const customerOtpRequestSchema = z.object({
  email: z.string().trim().email("Please use a valid email address."),
  name: z.string().trim().min(2).optional(),
  mode: z.enum(["signup", "login"]),
});

export const customerOtpVerifySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().regex(/^\d{6}$/, "OTP code must be 6 digits."),
  mode: z.enum(["signup", "login"]),
  name: z.string().trim().min(2).optional(),
});
