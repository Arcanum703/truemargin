import Link from "next/link";
import { Card } from "@/components/shell";

export type OnboardingState = { hasOrders: boolean; productCount: number; missingCosts: number };

export function hasMissingCosts(product: { materialCost: number; laborMinutes: number; packagingCost: number }) {
  return product.materialCost === 0 && product.laborMinutes === 0 && product.packagingCost === 0;
}

export function onboardingComplete(state: OnboardingState) {
  return state.hasOrders && state.missingCosts === 0;
}

export function OnboardingChecklist({ state }: { state: OnboardingState }) {
  const steps = [
    { done: state.hasOrders, title: "Import your Etsy orders", body: "Two CSVs from Shop Manager, or load the demo shop to look around first.", href: "/app/import", cta: state.hasOrders ? "Import more" : "Import now" },
    { done: state.hasOrders && state.missingCosts === 0, title: "Add what each product costs you", body: state.hasOrders ? `${state.missingCosts} of ${state.productCount} products still have no material, labor, or packaging cost.` : "Materials, minutes of labor, packaging. Takes a minute per product.", href: "/app/products", cta: "Add costs" },
    { done: onboardingComplete(state), title: "See your real profit", body: "Every fee, shipping, and cost subtracted per product. Red rows need a price change.", href: "/app", cta: "View dashboard" },
  ];
  const current = steps.findIndex((step) => !step.done);
  return <Card className="mb-5 border-violet-200 bg-gradient-to-br from-white to-violet-50">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-semibold">Get to your true margin in 3 steps</h2><p className="text-xs text-slate-500">{steps.filter((step) => step.done).length} of 3 done</p></div>
    <ol className="mt-4 grid gap-4 md:grid-cols-3">{steps.map((step, index) => <li key={step.title} className={`flex gap-3 rounded-xl border p-4 ${index === current ? "border-violet-400 bg-white shadow-sm" : "border-transparent"}`}>
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${step.done ? "bg-emerald-600 text-white" : index === current ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-600"}`}>{step.done ? "✓" : index + 1}</span>
      <div className="min-w-0"><p className={`text-sm font-semibold ${step.done ? "text-slate-500 line-through" : ""}`}>{step.title}</p><p className="mt-1 text-xs text-slate-500">{step.body}</p>{!step.done && index === current && <Link href={step.href} className="mt-3 inline-block rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">{step.cta} →</Link>}</div>
    </li>)}</ol>
  </Card>;
}

export function MissingCostsNotice({ state }: { state: OnboardingState }) {
  if (!state.hasOrders || state.missingCosts === 0) return null;
  return <div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
    <strong>{state.missingCosts} of {state.productCount} products have no costs yet</strong> — their profit below is just revenue minus Etsy fees and shipping, so it looks better than it is. <Link href="/app/products" className="font-semibold underline">Add costs →</Link>
  </div>;
}
