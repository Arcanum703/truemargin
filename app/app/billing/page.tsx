import { openBillingPortalAction, startCheckoutAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Card, Notice, Shell } from "@/components/shell";
import { isSubscribed, requireWorkspace, shellUser } from "@/lib/auth";
import { billingEnabled } from "@/lib/env";

const LABELS = { TRIALING: "Free trial", ACTIVE: "Active subscription", PAST_DUE: "Payment past due", CANCELED: "Canceled", INCOMPLETE: "Payment incomplete" } as const;

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string; canceled?: string; expired?: string }> }) {
  const params = await searchParams;
  const context = await requireWorkspace();
  const { workspace, membership } = context;
  const active = isSubscribed(workspace);
  const isOwner = membership.role === "OWNER";
  return <Shell title="Billing" user={shellUser(context)}>
    {params.success === "1" && <Notice kind="success">Thanks! Your subscription is being activated. This page updates as soon as Stripe confirms the payment.</Notice>}
    {params.canceled === "1" && <Notice>Checkout was canceled. Your workspace is unchanged.</Notice>}
    {params.expired === "1" && <Notice kind="error">Your trial has ended. Start a subscription to continue importing and editing.</Notice>}
    <div className="grid gap-5 md:grid-cols-2">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Current plan</p>
        <h2 className="mt-2 text-2xl font-semibold">{LABELS[workspace.subscriptionStatus]}</h2>
        <p className="mt-2 text-sm text-slate-600">{workspace.subscriptionStatus === "ACTIVE" && workspace.currentPeriodEnd ? `Renews ${workspace.currentPeriodEnd.toLocaleDateString("en-US", { dateStyle: "medium" })}.` : workspace.trialEndsAt > new Date() ? `Trial ends ${workspace.trialEndsAt.toLocaleDateString("en-US", { dateStyle: "medium" })}.` : workspace.subscriptionStatus === "PAST_DUE" ? "Update your payment method to keep access." : "Your workspace is read-only until you subscribe."}</p>
        <p className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{active ? "Full access" : "Read-only"}</p>
      </Card>
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">TrueMargin Pro</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600"><li>✓ Unlimited Etsy imports</li><li>✓ Product profitability, alerts, and pricing</li><li>✓ Tax-time CSV exports</li><li>✓ Email support</li></ul>
        {!billingEnabled && <p className="mt-4 text-sm text-slate-500">Paid plans are not enabled on this deployment yet.</p>}
        {billingEnabled && !isOwner && <p className="mt-4 text-sm text-slate-500">Only the workspace owner can manage billing.</p>}
        {billingEnabled && isOwner && workspace.subscriptionStatus !== "ACTIVE" && <div className="mt-4"><ActionForm action={startCheckoutAction} submitLabel="Subscribe with Stripe" /></div>}
        {billingEnabled && isOwner && workspace.stripeCustomerId && <div className="mt-3"><ActionForm action={openBillingPortalAction} submitLabel="Manage payment method, invoices, or cancel" submitClassName="text-sm font-semibold text-violet-700 hover:underline" /></div>}
        <p className="mt-4 text-xs text-slate-500">Payments are processed by Stripe. TrueMargin never sees or stores your card number.</p>
      </Card>
    </div>
  </Shell>;
}
