import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hash, verify } from "@node-rs/argon2";
import type { Membership, Settings, User, Workspace } from "@prisma/client";
import { db } from "@/lib/db";
import { env, isProduction } from "@/lib/env";
import { audit } from "@/lib/audit";
import { hashToken, randomToken, requestContext, UserFacingError } from "@/lib/security";

export const SESSION_COOKIE = "tm_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_TOUCH_MS = 60 * 60 * 1000;
const ARGON2 = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export async function hashPassword(password: string) {
  return hash(password, ARGON2);
}

export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

export const cookieOptions = () => ({ httpOnly: true, secure: isProduction, sameSite: "lax" as const, path: "/", maxAge: SESSION_TTL_MS / 1000 });

export async function createSession(userId: string) {
  const token = randomToken(32);
  const { ipHash, userAgent } = await requestContext();
  await db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS), ipHash, userAgent } });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions());
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

export async function revokeAllSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  if (Date.now() - session.lastSeenAt.getTime() > SESSION_TOUCH_MS) await db.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
  return session.user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export type WorkspaceContext = { user: User; membership: Membership; workspace: Workspace & { settings: Settings } };

export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const membership = await db.membership.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" }, include: { workspace: { include: { settings: true } } } });
  if (!membership) return null;
  const settings = membership.workspace.settings ?? await db.settings.create({ data: { workspaceId: membership.workspaceId } });
  const { workspace, ...rest } = membership;
  return { user, membership: rest, workspace: { ...workspace, settings } };
});

export async function requireWorkspace() {
  const context = await getWorkspaceContext();
  if (!context) redirect("/login");
  if (env.DEMO_MODE !== "1" && !context.user.emailVerifiedAt) redirect("/verify");
  return context;
}

export function isSubscribed(workspace: Workspace) {
  if (workspace.subscriptionStatus === "ACTIVE") return true;
  if (workspace.subscriptionStatus === "PAST_DUE" && workspace.currentPeriodEnd && workspace.currentPeriodEnd > new Date()) return true;
  return workspace.trialEndsAt > new Date();
}

export async function requireActiveWorkspace() {
  const context = await requireWorkspace();
  if (!isSubscribed(context.workspace)) redirect("/app/billing?expired=1");
  return context;
}

export function assertActiveWorkspace(workspace: Workspace) {
  if (!isSubscribed(workspace)) throw new UserFacingError("Your trial has ended. Start a subscription to keep importing and editing.");
}

export async function verifyEmailToken(token: string) {
  if (!token || token.length > 256) return false;
  const record = await db.authToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.type !== "EMAIL_VERIFY" || record.usedAt || record.expiresAt <= new Date()) return false;
  await db.$transaction([
    db.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
  ]);
  await audit("user.email_verified", { userId: record.userId });
  return true;
}

export function shellUser(context: WorkspaceContext) {
  const subscribed = isSubscribed(context.workspace);
  const onTrial = context.workspace.subscriptionStatus !== "ACTIVE" && context.workspace.trialEndsAt > new Date();
  const trialDaysLeft = onTrial ? Math.max(0, Math.ceil((context.workspace.trialEndsAt.getTime() - Date.now()) / 86_400_000)) : null;
  return { email: context.user.email, workspaceName: context.workspace.name, trialDaysLeft, subscribed };
}
