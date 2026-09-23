import { z } from "zod";

const COMMON_PASSWORDS = new Set(["password", "password1", "password12", "password123", "123456789", "1234567890", "qwertyuiop", "iloveyou", "letmein123", "welcome123", "admin12345", "changeme123", "truemargin", "etsyseller", "passw0rd!", "abc123456", "sunshine1", "princess1", "football1", "monkey123", "dragon123", "baseball1", "trustno1", "1q2w3e4r5t", "qwerty123", "asdfghjkl", "zxcvbnm123", "11111111", "00000000", "12345678"]);

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const passwordSchema = z.string().min(10, "Use at least 10 characters.").max(128, "Passwords are limited to 128 characters.").refine((value) => !COMMON_PASSWORDS.has(value.toLowerCase()), "That password is too common. Choose something more unique.").refine((value) => new Set(value).size >= 5, "Use a wider mix of characters.");

export const signupSchema = z.object({ email: emailSchema, password: passwordSchema, shopName: z.string().trim().min(1).max(80).default("My Etsy shop"), acceptTerms: z.literal("on", { error: "You must accept the Terms and Privacy Policy." }) });
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });
export const resetRequestSchema = z.object({ email: emailSchema });
export const resetSchema = z.object({ token: z.string().min(16).max(256), password: passwordSchema });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(128), password: passwordSchema });
export const deleteAccountSchema = z.object({ password: z.string().min(1).max(128), confirm: z.literal("DELETE", { error: "Type DELETE to confirm." }) });

const money = (max: number) => z.coerce.number().min(0).max(max).default(0);
const percent = z.coerce.number().min(0).max(100);
export const id = z.string().regex(/^[a-z0-9]{20,32}$/i, "Invalid identifier.");

export const productSchema = z.object({
  id: id.optional().or(z.literal("")),
  name: z.string().trim().min(1, "Name is required.").max(200),
  sku: z.string().trim().max(100).default(""),
  materialCost: money(1_000_000),
  laborMinutes: z.coerce.number().min(0).max(100_000).default(0),
  packagingCost: money(1_000_000),
  stockOnHand: z.coerce.number().min(0).max(10_000_000).default(0),
  reorderPoint: z.coerce.number().min(0).max(10_000_000).default(0),
});

export const settingsSchema = z.object({
  hourlyRate: money(10_000),
  listingFee: money(1_000),
  transactionRate: percent.default(6.5),
  paymentRate: percent.default(3),
  paymentFixed: money(1_000),
  offsiteAdsEnabled: z.boolean(),
  offsiteAdsRate: percent.default(15),
  estimatedOffsitePercent: percent.default(0),
  defaultShippingCost: money(10_000),
  marginThreshold: percent.default(30),
  targetMargin: percent.default(40),
  workspaceName: z.string().trim().min(1).max(80),
});

export const toggleOffsiteSchema = z.object({ orderId: id, offsiteAds: z.boolean() });

export function formToObject(formData: FormData) {
  const record: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") record[key] = value;
  return record;
}

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid input.";
}
