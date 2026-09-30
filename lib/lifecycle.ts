import crypto from "node:crypto";
import { db } from "@/lib/db";
import { sendLifecycleEmail } from "@/lib/email";
import { env } from "@/lib/env";

const DAY_MS = 24 * 60 * 60 * 1000;
const BATCH = 200;

export const LIFECYCLE_KINDS = ["welcome", "no_import", "add_costs", "trial_ending", "trial_ended"] as const;
export type LifecycleKind = (typeof LIFECYCLE_KINDS)[number];

export function unsubscribeToken(userId: string) {
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(`unsubscribe:${userId}`).digest("base64url");
}

export function unsubscribeUrl(userId: string) {
  return `${env.APP_URL}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`;
}

export type Candidate = {
  id: string;
  email: string;
  createdAt: Date;
  workspace: { trialEndsAt: Date; subscriptionStatus: string; orders: number; products: number; costedProducts: number } | null;
  sent: Set<string>;
};

export function pickKind(user: Candidate, now: number): LifecycleKind | null {
  const ws = user.workspace;
  if (!ws) return null;
  const ageDays = (now - user.createdAt.getTime()) / DAY_MS;
  const trialLeftDays = (ws.trialEndsAt.getTime() - now) / DAY_MS;
  const trialing = ws.subscriptionStatus === "TRIALING";
  const has = (kind: LifecycleKind) => user.sent.has(kind);

  if (trialing && trialLeftDays < 0 && !has("trial_ended")) return "trial_ended";
  if (trialing && trialLeftDays >= 0 && trialLeftDays <= 3 && !has("trial_ending")) return "trial_ending";
  if (!has("welcome") && ageDays < 7) return "welcome";
  if (!has("no_import") && ws.orders === 0 && ageDays >= 1 && ageDays < 10) return "no_import";
  if (!has("add_costs") && ws.orders > 0 && ws.products > 0 && ws.costedProducts === 0 && ageDays >= 2 && ageDays < 14) return "add_costs";
  return null;
}

export async function runLifecycle(now = Date.now()) {
  const users = await db.user.findMany({
    where: { emailVerifiedAt: { not: null }, marketingOptOut: false, createdAt: { gte: new Date(now - 60 * DAY_MS) } },
    take: BATCH,
    orderBy: { createdAt: "asc" },
    include: {
      lifecycleEmails: { select: { kind: true } },
      memberships: { where: { role: "OWNER" }, take: 1, include: { workspace: { select: { id: true, trialEndsAt: true, subscriptionStatus: true, _count: { select: { orders: true, products: true } } } } } },
    },
  });

  const sent: Array<{ userId: string; kind: LifecycleKind }> = [];
  for (const user of users) {
    const ws = user.memberships[0]?.workspace;
    const costedProducts = ws ? await db.product.count({ where: { workspaceId: ws.id, OR: [{ materialCost: { gt: 0 } }, { laborMinutes: { gt: 0 } }, { packagingCost: { gt: 0 } }] } }) : 0;
    const candidate: Candidate = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      workspace: ws ? { trialEndsAt: ws.trialEndsAt, subscriptionStatus: ws.subscriptionStatus, orders: ws._count.orders, products: ws._count.products, costedProducts } : null,
      sent: new Set(user.lifecycleEmails.map((entry) => entry.kind)),
    };
    const kind = pickKind(candidate, now);
    if (!kind) continue;
    const claimed = await db.lifecycleEmail.create({ data: { userId: user.id, kind } }).then(() => true).catch(() => false);
    if (!claimed) continue;
    try {
      await sendLifecycleEmail(kind, user.email, unsubscribeUrl(user.id));
      sent.push({ userId: user.id, kind });
    } catch (error) {
      await db.lifecycleEmail.deleteMany({ where: { userId: user.id, kind } });
      console.error("[lifecycle]", kind, error instanceof Error ? error.message : error);
    }
  }
  return { scanned: users.length, sent };
}
