"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { ActionState } from "@/lib/action-state";
import { audit } from "@/lib/audit";
import { assertActiveWorkspace, createSession, destroySession, getCurrentUser, hashPassword, requireUser, requireWorkspace, revokeAllSessions, verifyPassword } from "@/lib/auth";
import { cancelSubscription, createCheckoutSession, createPortalSession } from "@/lib/billing";
import { applyDemoCosts, importEtsyCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { sendPasswordResetEmail, sendSecurityNotice, sendVerificationEmail } from "@/lib/email";
import { emailEnabled, env } from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";
import { hashToken, randomToken, requestContext, toUserMessage, UserFacingError } from "@/lib/security";
import { changePasswordSchema, deleteAccountSchema, firstIssue, formToObject, loginSchema, productSchema, resetRequestSchema, resetSchema, settingsSchema, signupSchema, toggleOffsiteSchema } from "@/lib/validation";

const MAX_ORDERS_PER_WORKSPACE = 250_000;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const LOCK_AFTER_FAILURES = 8;
const LOCK_MS = 15 * 60 * 1000;
const DUMMY_HASH = "$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

async function guarded(run: () => Promise<ActionState | void>): Promise<ActionState> {
  try {
    return (await run()) ?? {};
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (!(error instanceof UserFacingError)) console.error("[action]", error instanceof Error ? error.message : error);
    return { error: toUserMessage(error) };
  }
}

function revalidateWorkspace() {
  for (const route of ["/app", "/app/import", "/app/products", "/app/export", "/app/settings", "/app/billing", "/app/account"]) revalidatePath(route);
  revalidatePath("/app/products/[id]", "page");
}

async function issueToken(userId: string, type: "EMAIL_VERIFY" | "PASSWORD_RESET", ttlMs: number) {
  const token = randomToken(32);
  await db.authToken.deleteMany({ where: { userId, type, usedAt: null } });
  await db.authToken.create({ data: { userId, type, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + ttlMs) } });
  return token;
}

export async function signupAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { ipHash } = await requestContext();
    await consumeRateLimit("signup", ipHash);
    const parsed = signupSchema.safeParse(formToObject(formData));
    if (!parsed.success) throw new UserFacingError(firstIssue(parsed.error));
    const { email, password, shopName } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      if (emailEnabled) await sendSecurityNotice(email, "TrueMargin sign-up attempt", "Someone tried to create a TrueMargin account with this email, but an account already exists. If this was you, log in or reset your password.");
      return { success: "Check your inbox to confirm your email and finish setting up." };
    }
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({ data: { email, passwordHash, emailVerifiedAt: emailEnabled && env.DEMO_MODE !== "1" ? null : new Date(), memberships: { create: { role: "OWNER", workspace: { create: { name: shopName, trialEndsAt: new Date(Date.now() + env.TRIAL_DAYS * 24 * 60 * 60 * 1000), settings: { create: {} } } } } } }, include: { memberships: true } });
    await audit("user.signup", { userId: user.id, workspaceId: user.memberships[0]?.workspaceId });
    if (!user.emailVerifiedAt) {
      const token = await issueToken(user.id, "EMAIL_VERIFY", VERIFY_TTL_MS);
      await sendVerificationEmail(email, token);
    }
    await createSession(user.id);
    redirect(user.emailVerifiedAt ? "/app" : "/verify");
  });
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { ipHash } = await requestContext();
    await consumeRateLimit("login", ipHash);
    const parsed = loginSchema.safeParse(formToObject(formData));
    if (!parsed.success) throw new UserFacingError("Invalid email or password.");
    const { email, password } = parsed.data;
    await consumeRateLimit("login", `email:${email}`);
    const user = await db.user.findUnique({ where: { email } });
    if (user?.lockedUntil && user.lockedUntil > new Date()) throw new UserFacingError("This account is temporarily locked after too many failed attempts. Try again in a few minutes or reset your password.");
    const ok = await verifyPassword(user?.passwordHash ?? DUMMY_HASH, password);
    if (!user || !ok) {
      if (user) {
        const failures = user.failedLoginCount + 1;
        await db.user.update({ where: { id: user.id }, data: { failedLoginCount: failures, lockedUntil: failures >= LOCK_AFTER_FAILURES ? new Date(Date.now() + LOCK_MS) : null } });
        await audit("user.login_failed", { userId: user.id });
      }
      throw new UserFacingError("Invalid email or password.");
    }
    await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null } });
    await createSession(user.id);
    await audit("user.login", { userId: user.id });
    redirect("/app");
  });
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await destroySession();
  if (user) await audit("user.logout", { userId: user.id });
  redirect("/login");
}

export async function resendVerificationAction(): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    if (user.emailVerifiedAt) redirect("/app");
    await consumeRateLimit("emailVerify", user.id);
    const token = await issueToken(user.id, "EMAIL_VERIFY", VERIFY_TTL_MS);
    await sendVerificationEmail(user.email, token);
    return { success: "A fresh confirmation link is on its way." };
  });
}

export async function requestPasswordResetAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { ipHash } = await requestContext();
    await consumeRateLimit("passwordReset", ipHash);
    const parsed = resetRequestSchema.safeParse(formToObject(formData));
    const message = { success: "If an account exists for that email, a reset link has been sent." };
    if (!parsed.success) return message;
    await consumeRateLimit("passwordReset", `email:${parsed.data.email}`);
    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      const token = await issueToken(user.id, "PASSWORD_RESET", RESET_TTL_MS);
      await sendPasswordResetEmail(user.email, token);
      await audit("user.password_reset_requested", { userId: user.id });
    }
    return message;
  });
}

export async function resetPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { ipHash } = await requestContext();
    await consumeRateLimit("passwordReset", ipHash);
    const parsed = resetSchema.safeParse(formToObject(formData));
    if (!parsed.success) throw new UserFacingError(firstIssue(parsed.error));
    const record = await db.authToken.findUnique({ where: { tokenHash: hashToken(parsed.data.token) }, include: { user: true } });
    if (!record || record.type !== "PASSWORD_RESET" || record.usedAt || record.expiresAt <= new Date()) throw new UserFacingError("This reset link is invalid or has expired. Request a new one.");
    const passwordHash = await hashPassword(parsed.data.password);
    await db.$transaction([
      db.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      db.user.update({ where: { id: record.userId }, data: { passwordHash, failedLoginCount: 0, lockedUntil: null, emailVerifiedAt: record.user.emailVerifiedAt ?? new Date() } }),
    ]);
    await revokeAllSessions(record.userId);
    await audit("user.password_reset", { userId: record.userId });
    if (emailEnabled) await sendSecurityNotice(record.user.email, "Your TrueMargin password was changed", "Your password was just reset and all other sessions were signed out. If this was not you, reset your password again immediately and contact support.");
    await createSession(record.userId);
    redirect("/app");
  });
}

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await consumeRateLimit("account", user.id);
    const parsed = changePasswordSchema.safeParse(formToObject(formData));
    if (!parsed.success) throw new UserFacingError(firstIssue(parsed.error));
    if (!(await verifyPassword(user.passwordHash, parsed.data.currentPassword))) throw new UserFacingError("Current password is incorrect.");
    await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password) } });
    await revokeAllSessions(user.id);
    await createSession(user.id);
    await audit("user.password_changed", { userId: user.id });
    if (emailEnabled) await sendSecurityNotice(user.email, "Your TrueMargin password was changed", "Your password was changed and other sessions were signed out. If this was not you, reset your password immediately.");
    return { success: "Password updated. Other devices have been signed out." };
  });
}

export async function signOutEverywhereAction(): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await revokeAllSessions(user.id);
    await createSession(user.id);
    await audit("user.sessions_revoked", { userId: user.id });
    return { success: "All other sessions have been signed out." };
  });
}

export async function deleteAccountAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { user, workspace } = await requireWorkspace();
    await consumeRateLimit("account", user.id);
    const parsed = deleteAccountSchema.safeParse(formToObject(formData));
    if (!parsed.success) throw new UserFacingError(firstIssue(parsed.error));
    if (!(await verifyPassword(user.passwordHash, parsed.data.password))) throw new UserFacingError("Password is incorrect.");
    if (workspace.stripeSubscriptionId && workspace.subscriptionStatus === "ACTIVE") {
      await cancelSubscription(workspace.stripeSubscriptionId);
    }
    await audit("user.deleted", { userId: null, workspaceId: null, metadata: { emailHash: hashToken(user.email).slice(0, 16) } });
    const soleOwnerWorkspaces = await db.workspace.findMany({ where: { AND: [{ memberships: { some: { userId: user.id } } }, { memberships: { every: { userId: user.id } } }] }, select: { id: true } });
    await db.$transaction([
      db.workspace.deleteMany({ where: { id: { in: soleOwnerWorkspaces.map((item) => item.id) } } }),
      db.user.delete({ where: { id: user.id } }),
    ]);
    await destroySession();
    redirect("/?deleted=1");
  });
}

async function importFiles(workspaceId: string, ordersCsv: string, itemsCsv: string) {
  const existing = await db.order.count({ where: { workspaceId } });
  if (existing >= MAX_ORDERS_PER_WORKSPACE) throw new UserFacingError("This workspace has reached the order limit. Contact support to raise it.");
  const result = await importEtsyCsv(workspaceId, ordersCsv, itemsCsv);
  revalidateWorkspace();
  return result;
}

export async function loadDemoShopAction(): Promise<ActionState> {
  return guarded(async () => {
    const { user, workspace } = await requireWorkspace();
    assertActiveWorkspace(workspace);
    await consumeRateLimit("import", workspace.id);
    const ordersCsv = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrders_demo.csv"), "utf8");
    const itemsCsv = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrderItems_demo.csv"), "utf8");
    const result = await importFiles(workspace.id, ordersCsv, itemsCsv);
    await applyDemoCosts(workspace.id);
    await audit("import.demo", { userId: user.id, workspaceId: workspace.id, metadata: result });
    redirect("/app?demo=1");
  });
}

async function readCsvField(formData: FormData, textName: string, fileName: string) {
  const file = formData.get(fileName);
  if (file instanceof File && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) throw new UserFacingError("Each CSV must be 5 MB or smaller.");
    if (!/\.csv$/i.test(file.name) && !["text/csv", "application/vnd.ms-excel", "text/plain"].includes(file.type)) throw new UserFacingError("Only .csv files are accepted.");
    return Buffer.from(await file.arrayBuffer()).toString("utf8");
  }
  const text = formData.get(textName);
  return typeof text === "string" ? text : "";
}

export async function importCsvAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { user, workspace } = await requireWorkspace();
    assertActiveWorkspace(workspace);
    await consumeRateLimit("import", workspace.id);
    const ordersCsv = await readCsvField(formData, "ordersCsv", "ordersFile");
    const itemsCsv = await readCsvField(formData, "itemsCsv", "itemsFile");
    if (!ordersCsv.trim() || !itemsCsv.trim()) throw new UserFacingError("Both Etsy CSVs are required.");
    const result = await importFiles(workspace.id, ordersCsv, itemsCsv);
    await audit("import.csv", { userId: user.id, workspaceId: workspace.id, metadata: result });
    redirect(`/app/products?imported=${result.orders}&items=${result.items}`);
  });
}

export async function saveProductAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { user, workspace } = await requireWorkspace();
    assertActiveWorkspace(workspace);
    await consumeRateLimit("mutation", workspace.id);
    const parsed = productSchema.safeParse(formToObject(formData));
    if (!parsed.success) throw new UserFacingError(firstIssue(parsed.error));
    const { id, ...data } = parsed.data;
    if (id) {
      const updated = await db.product.updateMany({ where: { id, workspaceId: workspace.id }, data });
      if (updated.count !== 1) throw new UserFacingError("Product not found.");
    } else {
      await db.product.create({ data: { ...data, workspaceId: workspace.id } });
    }
    await audit("product.saved", { userId: user.id, workspaceId: workspace.id, metadata: { id: id || "new" } });
    revalidateWorkspace();
    return { success: "Saved." };
  });
}

export async function toggleOffsiteAction(formData: FormData) {
  const { workspace } = await requireWorkspace();
  assertActiveWorkspace(workspace);
  await consumeRateLimit("mutation", workspace.id);
  const parsed = toggleOffsiteSchema.safeParse({ orderId: formData.get("orderId"), offsiteAds: formData.get("offsiteAds") === "on" });
  if (!parsed.success) throw new UserFacingError("Invalid order.");
  await db.order.updateMany({ where: { id: parsed.data.orderId, workspaceId: workspace.id }, data: { offsiteAdsAttributed: parsed.data.offsiteAds } });
  revalidatePath("/app");
  revalidatePath("/app/settings");
}

export async function saveSettingsAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { user, workspace } = await requireWorkspace();
    assertActiveWorkspace(workspace);
    await consumeRateLimit("mutation", workspace.id);
    const parsed = settingsSchema.safeParse({ ...formToObject(formData), offsiteAdsEnabled: formData.get("offsiteAdsEnabled") === "on" });
    if (!parsed.success) throw new UserFacingError(firstIssue(parsed.error));
    const { workspaceName, ...settings } = parsed.data;
    await db.$transaction([
      db.settings.upsert({ where: { workspaceId: workspace.id }, update: settings, create: { workspaceId: workspace.id, ...settings } }),
      db.workspace.update({ where: { id: workspace.id }, data: { name: workspaceName } }),
    ]);
    await audit("settings.saved", { userId: user.id, workspaceId: workspace.id });
    revalidateWorkspace();
    return { success: "Settings saved." };
  });
}

export async function clearWorkspaceDataAction(): Promise<ActionState> {
  return guarded(async () => {
    const { user, workspace, membership } = await requireWorkspace();
    if (membership.role !== "OWNER") throw new UserFacingError("Only the workspace owner can clear data.");
    await consumeRateLimit("account", workspace.id);
    await db.$transaction([
      db.orderItem.deleteMany({ where: { workspaceId: workspace.id } }),
      db.order.deleteMany({ where: { workspaceId: workspace.id } }),
      db.product.deleteMany({ where: { workspaceId: workspace.id } }),
    ]);
    await audit("workspace.cleared", { userId: user.id, workspaceId: workspace.id });
    revalidateWorkspace();
    return { success: "All imported orders and products were deleted." };
  });
}

export async function startCheckoutAction(_: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { user, workspace, membership } = await requireWorkspace();
    if (membership.role !== "OWNER") throw new UserFacingError("Only the workspace owner can manage billing.");
    const interval = formData.get("interval") === "yearly" ? "yearly" : "monthly";
    await consumeRateLimit("billing", workspace.id);
    const url = await createCheckoutSession(workspace, user.email, interval);
    await audit("billing.checkout_started", { userId: user.id, workspaceId: workspace.id, metadata: { interval } });
    redirect(url);
  });
}

export async function openBillingPortalAction(): Promise<ActionState> {
  return guarded(async () => {
    const { user, workspace, membership } = await requireWorkspace();
    if (membership.role !== "OWNER") throw new UserFacingError("Only the workspace owner can manage billing.");
    await consumeRateLimit("billing", workspace.id);
    const url = await createPortalSession(workspace);
    await audit("billing.portal_opened", { userId: user.id, workspaceId: workspace.id });
    redirect(url);
  });
}
