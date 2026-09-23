import { db } from "@/lib/db";
import { UserFacingError } from "@/lib/security";

export type RateLimitRule = { limit: number; windowSeconds: number };

export const RATE_LIMITS = {
  login: { limit: 10, windowSeconds: 15 * 60 },
  signup: { limit: 5, windowSeconds: 60 * 60 },
  passwordReset: { limit: 5, windowSeconds: 60 * 60 },
  emailVerify: { limit: 5, windowSeconds: 60 * 60 },
  import: { limit: 20, windowSeconds: 60 * 60 },
  mutation: { limit: 240, windowSeconds: 60 * 60 },
  billing: { limit: 10, windowSeconds: 60 * 60 },
  account: { limit: 5, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;

export async function consumeRateLimit(scope: keyof typeof RATE_LIMITS, subject: string) {
  const rule = RATE_LIMITS[scope];
  const key = `${scope}:${subject || "anonymous"}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + rule.windowSeconds * 1000);
  const record = await db.$transaction(async (tx) => {
    const existing = await tx.rateLimit.findUnique({ where: { key } });
    if (!existing || existing.resetAt <= now) return tx.rateLimit.upsert({ where: { key }, update: { count: 1, resetAt }, create: { key, count: 1, resetAt } });
    return tx.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  });
  if (record.count > rule.limit) {
    const minutes = Math.max(1, Math.ceil((record.resetAt.getTime() - now.getTime()) / 60000));
    throw new UserFacingError(`Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }
}
