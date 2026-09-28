import { saveSettingsAction, toggleOffsiteAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Card, Shell } from "@/components/shell";
import { shellUser } from "@/lib/auth";
import { getDashboard } from "@/lib/queries";

const ETSY_DEFAULTS = { listingFee: 0.2, transactionRate: 6.5, paymentRate: 3, paymentFixed: 0.25, offsiteAdsRate: 15 };

function Field({ label, name, value, step, hint, defaultValue }: { label: string; name: string; value: number; step: string; hint?: string; defaultValue?: number }) {
  const isDefault = defaultValue !== undefined && value === defaultValue;
  return <div><label>{label}</label><input name={name} type="number" step={step} defaultValue={value} /><p className="mt-1 text-xs text-ink-500">{hint}{defaultValue !== undefined && (isDefault ? " Etsy US default." : ` Etsy US default is ${defaultValue}.`)}</p></div>;
}

export default async function SettingsPage() {
  const { settings, orders, context } = await getDashboard();
  const flaggedCount = orders.filter((order) => order.offsiteAdsAttributed).length;
  return <Shell title="Fees & assumptions" user={shellUser(context)}>
    <Card>
      <h2 className="font-semibold">Your shop</h2>
      <p className="mb-5 mt-1 text-sm text-ink-500">Only the labor rate needs your input. The Etsy fees below are already set to Etsy&apos;s current US rates and only apply when an export doesn&apos;t include the actual fee.</p>
      <ActionForm action={saveSettingsAction} submitLabel="Save settings" className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><label>Shop / workspace name</label><input name="workspaceName" defaultValue={context.workspace.name} required maxLength={80} /></div>
        <Field label="Your hourly labor rate ($)" name="hourlyRate" value={settings.hourlyRate} step="0.01" hint="What an hour of your time is worth. Multiplied by each product's labor minutes." />
        <Field label="Default shipping cost per order ($)" name="defaultShippingCost" value={settings.defaultShippingCost} step="0.01" hint="Your average postage + label cost. Used when you pay shipping." />
        <Field label="Red margin threshold (%)" name="marginThreshold" value={settings.marginThreshold} step="1" hint="Products below this are flagged red on the dashboard." />
        <Field label="Target margin (%)" name="targetMargin" value={settings.targetMargin} step="1" hint="Used for suggested prices on each product page." />
        <div className="sm:col-span-2 mt-2 border-t border-ink-100 pt-5"><h3 className="font-semibold">Etsy fees</h3><p className="mt-1 text-sm text-ink-500">Leave these unless Etsy changes its pricing or you sell outside the US.</p></div>
        <Field label="Listing fee per unit ($)" name="listingFee" value={settings.listingFee} step="0.01" defaultValue={ETSY_DEFAULTS.listingFee} />
        <Field label="Transaction fee (%)" name="transactionRate" value={settings.transactionRate} step="0.1" defaultValue={ETSY_DEFAULTS.transactionRate} />
        <Field label="Payment processing (%)" name="paymentRate" value={settings.paymentRate} step="0.1" defaultValue={ETSY_DEFAULTS.paymentRate} />
        <Field label="Payment fixed fee ($)" name="paymentFixed" value={settings.paymentFixed} step="0.01" defaultValue={ETSY_DEFAULTS.paymentFixed} />
        <div className="sm:col-span-2 mt-2 border-t border-ink-100 pt-5"><h3 className="font-semibold">Offsite Ads</h3><p className="mt-1 text-sm text-ink-500">Etsy charges 12–15% on sales that came from its offsite ads. Your export doesn&apos;t say which orders those were, so either flag them below or estimate a percentage.</p></div>
        <Field label="Offsite ads fee (%)" name="offsiteAdsRate" value={settings.offsiteAdsRate} step="0.1" hint="15% if your shop made under $10k last year, 12% otherwise." defaultValue={ETSY_DEFAULTS.offsiteAdsRate} />
        <Field label="Estimated % of orders via offsite ads" name="estimatedOffsitePercent" value={settings.estimatedOffsitePercent} step="1" hint="Used only when no order is flagged below." />
        <label className="flex items-center gap-2 sm:col-span-2"><input className="h-4 w-4" name="offsiteAdsEnabled" type="checkbox" defaultChecked={settings.offsiteAdsEnabled} /> Include offsite ads in true profit</label>
      </ActionForm>
    </Card>
    <Card className="mt-5">
      <div className="flex items-center justify-between"><div><h2 className="font-semibold">Flag offsite-ad orders</h2><p className="text-sm text-ink-500">Optional and more precise than the estimate above. {flaggedCount ? `${flaggedCount} flagged — the estimate is ignored.` : "None flagged yet — the estimate above is used."}</p></div></div>
      <div className="mt-4 max-h-80 overflow-auto">{orders.slice(0, 50).map((order) => <div key={order.id} className="flex items-center justify-between border-b border-ink-50 py-2 text-sm"><span>{order.externalId} · {order.buyer} · {order.saleDate.toISOString().slice(0, 10)}</span><form action={toggleOffsiteAction} className="flex items-center gap-2"><input type="hidden" name="orderId" value={order.id} /><label className="flex items-center gap-2 text-xs text-ink-500"><input type="checkbox" name="offsiteAds" defaultChecked={order.offsiteAdsAttributed} /> Offsite ad</label><button className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Save</button></form></div>)}{!orders.length && <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">Orders appear here after your first import.</p>}</div>
    </Card>
  </Shell>;
}
