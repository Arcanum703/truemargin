import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, Notice, Shell } from "@/components/shell";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

const FEES = ["$0.20 listing fee", "6.5% transaction fee", "3% + $0.25 processing", "12–15% Offsite Ads", "Shipping labels", "Materials & packaging", "Your time"];

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const params = await searchParams;
  if (await getCurrentUser()) redirect("/app");
  return <Shell>
    {params.deleted === "1" && <Notice kind="success">Your account and all of its data have been deleted.</Notice>}
    <section className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-white sm:px-12 sm:py-20">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-400/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-32 h-72 w-72 rounded-full bg-brand-900/40 blur-3xl" />
      <div className="relative max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-50">Made for Etsy sellers</p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Your Etsy sales look great.<br /><span className="text-brand-100">What do you actually keep?</span></h1>
        <p className="mt-6 max-w-xl text-lg text-brand-50/90">Upload the two CSVs Etsy already gives you. TrueMargin subtracts every Etsy fee, shipping, ads, and your own costs — and shows the real profit on each listing in under a minute.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/signup" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-md hover:bg-brand-50">Start {env.TRIAL_DAYS}-day free trial</Link><Link href="/login" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">Log in</Link></div>
        <p className="mt-4 text-xs text-brand-100">No credit card for the trial · Try it with a demo shop first · Cancel anytime</p>
      </div>
    </section>

    <section className="mt-10 grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Why sellers underestimate their costs</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Etsy takes its cut in seven places. Your bank statement shows one number.</h2>
        <p className="mt-3 text-ink-600">Most shops only find out a bestseller was a money-loser at tax time. TrueMargin does the math per order and per product, using Etsy&apos;s current US fee schedule (editable if yours differs).</p>
      </div>
      <Card className="bg-ink-950 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">One $28 mug, honestly</p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {FEES.map((fee) => <li key={fee} className="flex justify-between border-b border-white/10 pb-1.5 text-ink-200"><span>{fee}</span><span className="text-ink-400">−</span></li>)}
          <li className="flex justify-between pt-2 font-display text-lg font-semibold"><span>You keep</span><span className="text-brand-300">$9.60 · 34%</span></li>
        </ul>
      </Card>
    </section>

    <div className="mt-10 grid gap-5 md:grid-cols-3">
      <Card><span className="text-2xl">1</span><h2 className="mt-2 text-lg font-semibold">Import in 60 seconds</h2><p className="mt-2 text-sm text-ink-600">Shop Manager → Settings → Options → Download Data. Drop in the Orders and Order Items CSVs. Re-import anytime; nothing duplicates.</p></Card>
      <Card><span className="text-2xl">2</span><h2 className="mt-2 text-lg font-semibold">See profit per listing</h2><p className="mt-2 text-sm text-ink-600">Real margin after every fee, your best and worst products, profit per hour of your time, and the price that hits your target margin.</p></Card>
      <Card><span className="text-2xl">3</span><h2 className="mt-2 text-lg font-semibold">Fix prices, keep more</h2><p className="mt-2 text-sm text-ink-600">Red rows tell you what to raise or retire. Add material and labor costs when you want the full picture — optional, but eye-opening.</p></Card>
    </div>

    <div className="mt-8 grid gap-5 md:grid-cols-3">
      <Card><h2 className="font-semibold">Tax-time exports</h2><p className="mt-2 text-sm text-ink-600">Product P&amp;L, orders with fees, and a Schedule C style monthly summary. Your accountant will thank you.</p></Card>
      <Card><h2 className="font-semibold">Private by design</h2><p className="mt-2 text-sm text-ink-600">Your data lives in your own workspace, encrypted and isolated from every other shop. Export or delete everything at any time.</p><Link href="/security" className="mt-3 inline-block text-sm font-semibold text-brand-700">How we protect your data →</Link></Card>
      <Card><h2 className="font-semibold">Simple pricing</h2><p className="mt-2 text-sm text-ink-600">One plan, one shop, unlimited imports. Less than the fees on a single sale each month.</p><Link href="/signup" className="mt-3 inline-block text-sm font-semibold text-brand-700">Create your workspace →</Link></Card>
    </div>
  </Shell>;
}
