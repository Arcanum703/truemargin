import Stripe from "stripe";
import type { SubscriptionStatus, Workspace } from "@prisma/client";
import { db } from "@/lib/db";
import { billingEnabled, env } from "@/lib/env";
import { UserFacingError } from "@/lib/security";

let client: Stripe | null = null;
export function stripe() {
  if (!billingEnabled || !env.STRIPE_SECRET_KEY) throw new UserFacingError("Billing is not configured yet. Contact support.");
  client ??= new Stripe(env.STRIPE_SECRET_KEY, { typescript: true });
  return client;
}

async function ensureCustomer(workspace: Workspace, email: string) {
  if (workspace.stripeCustomerId) return workspace.stripeCustomerId;
  const customer = await stripe().customers.create({ email, metadata: { workspaceId: workspace.id } });
  await db.workspace.update({ where: { id: workspace.id }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}

export async function createCheckoutSession(workspace: Workspace, email: string) {
  if (workspace.subscriptionStatus === "ACTIVE" && workspace.stripeSubscriptionId) throw new UserFacingError("This workspace already has an active subscription.");
  const customer = await ensureCustomer(workspace, email);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${env.APP_URL}/app/billing?success=1`,
    cancel_url: `${env.APP_URL}/app/billing?canceled=1`,
    allow_promotion_codes: true,
    client_reference_id: workspace.id,
    subscription_data: { metadata: { workspaceId: workspace.id } },
    metadata: { workspaceId: workspace.id },
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session.url;
}

export async function createPortalSession(workspace: Workspace) {
  if (!workspace.stripeCustomerId) throw new UserFacingError("No billing account yet. Start a subscription first.");
  const session = await stripe().billingPortal.sessions.create({ customer: workspace.stripeCustomerId, return_url: `${env.APP_URL}/app/billing` });
  return session.url;
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    await stripe().subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error("[billing] cancel failed", error instanceof Error ? error.message : error);
  }
}

export function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active": return "ACTIVE";
    case "trialing": return "ACTIVE";
    case "past_due": return "PAST_DUE";
    case "unpaid": return "PAST_DUE";
    case "canceled": return "CANCELED";
    case "incomplete_expired": return "CANCELED";
    case "paused": return "CANCELED";
    default: return "INCOMPLETE";
  }
}

export async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const workspaceId = subscription.metadata?.workspaceId;
  const workspace = await db.workspace.findFirst({ where: workspaceId ? { id: workspaceId, stripeCustomerId: customerId } : { stripeCustomerId: customerId } });
  if (!workspace) {
    console.warn("[billing] subscription for unknown workspace", customerId);
    return;
  }
  const periodEnd = subscription.items.data.reduce<number | null>((latest, item) => Math.max(latest ?? 0, item.current_period_end), null);
  await db.workspace.update({ where: { id: workspace.id }, data: { stripeSubscriptionId: subscription.id, subscriptionStatus: mapStatus(subscription.status), currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null } });
}
