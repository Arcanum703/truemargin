import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { billingEnabled, env } from "@/lib/env";
import { stripe, syncSubscription } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 1024 * 1024;

export async function POST(request: Request) {
  if (!billingEnabled || !env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Billing disabled" }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const body = await request.text();
  if (body.length > MAX_BODY) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    await db.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe().subscriptions.retrieve(typeof session.subscription === "string" ? session.subscription : session.subscription.id);
        await syncSubscription(subscription);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      await syncSubscription(event.data.object);
      break;
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) await db.workspace.updateMany({ where: { stripeCustomerId: customerId }, data: { subscriptionStatus: "PAST_DUE" } });
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
