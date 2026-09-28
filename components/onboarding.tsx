import Link from "next/link";
import { loadDemoShopAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Card } from "@/components/shell";

export type OnboardingState = { hasOrders: boolean; productCount: number; missingCosts: number };

export function hasMissingCosts(product: { materialCost: number; laborMinutes: number; packagingCost: number }) {
  return product.materialCost === 0 && product.laborMinutes === 0 && product.packagingCost === 0;
}

export function onboardingComplete(state: OnboardingState) {
  return state.hasOrders;
}

const STEPS = [
  { title: "Import your Etsy orders", body: "Two CSVs from Shop Manager → Settings → Options → Download Data. Takes about a minute." },
  { title: "See profit after Etsy fees", body: "Listing, transaction, processing, Offsite Ads, and shipping — subtracted per product, automatically." },
  { title: "Optional: add your own costs", body: "Materials, minutes of labor, packaging. Add them for your top sellers when you want the full picture." },
];

export function OnboardingChecklist({ state }: { state: OnboardingState }) {
  if (state.hasOrders) return null;
  return <Card className="mb-6 overflow-hidden border-brand-200 bg-gradient-to-br from-white via-white to-brand-50 p-0">
    <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Welcome, Etsy seller</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Find out what you really keep on every sale.</h2>
        <p className="mt-2 text-sm text-ink-600">Your dashboard fills in the moment you import. Not ready with your own files? Load the demo shop and look around first.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href="/app/import" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">Import my Etsy CSVs →</Link>
          <ActionForm action={loadDemoShopAction} submitLabel="Try the demo shop" inline submitClassName="rounded-full border border-brand-300 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50" />
        </div>
      </div>
      <ol className="space-y-3">
        {STEPS.map((step, index) => <li key={step.title} className="flex gap-3 rounded-xl border border-ink-100 bg-white/80 p-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-900 font-display text-xs font-bold text-white">{index + 1}</span>
          <div><p className="text-sm font-semibold">{step.title}</p><p className="mt-0.5 text-xs text-ink-500">{step.body}</p></div>
        </li>)}
      </ol>
    </div>
  </Card>;
}

export function MissingCostsNotice({ state }: { state: OnboardingState }) {
  if (!state.hasOrders || state.missingCosts === 0) return null;
  const all = state.missingCosts === state.productCount;
  return <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
    <span>{all ? "Profit below is after Etsy fees and shipping only." : `${state.missingCosts} of ${state.productCount} products show profit after Etsy fees and shipping only.`} Add material or labor costs to your top sellers to see the full margin — optional, takes a minute.</span>
    <Link href="/app/products" className="shrink-0 rounded-full bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-950">Add costs →</Link>
  </div>;
}
