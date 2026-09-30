import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().default("http://localhost:3003"),
  SESSION_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("TrueMargin <noreply@example.com>"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),
  STRIPE_PRICE_ID_YEARLY: z.string().optional(),
  TRIAL_DAYS: z.coerce.number().int().min(0).max(90).default(14),
  DEMO_MODE: z.enum(["0", "1"]).default("0"),
  CRON_SECRET: z.string().min(16).optional(),
});

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

function load() {
  const source = isBuildPhase
    ? { ...process.env, DATABASE_URL: process.env.DATABASE_URL || "postgresql://build:build@localhost:5432/build", SESSION_SECRET: process.env.SESSION_SECRET || "build-phase-placeholder-secret-not-used-at-runtime" }
    : process.env;
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  if (parsed.data.NODE_ENV === "production" && !isBuildPhase && !parsed.data.APP_URL.startsWith("https://")) throw new Error("APP_URL must use https in production.");
  return parsed.data;
}

export const env = load();
export const isProduction = env.NODE_ENV === "production";
export const emailEnabled = Boolean(env.RESEND_API_KEY);
export const billingEnabled = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_ID && env.STRIPE_WEBHOOK_SECRET);
export const yearlyBillingEnabled = billingEnabled && Boolean(env.STRIPE_PRICE_ID_YEARLY);
