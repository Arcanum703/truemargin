import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, Notice, Shell } from "@/components/shell";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const params = await searchParams;
  if (await getCurrentUser()) redirect("/app");
  return <Shell>
    {params.deleted === "1" && <Notice kind="success">Your account and all of its data have been deleted.</Notice>}
    <section className="rounded-3xl bg-violet-950 px-6 py-14 text-white sm:px-12">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">For Etsy sellers</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Know what you actually keep on every Etsy sale.</h1>
      <p className="mt-4 max-w-xl text-lg text-violet-100">Import the two CSVs Etsy already gives you. TrueMargin applies listing, transaction, processing, and offsite-ads fees, plus your materials, labor, packaging, and shipping, to show real profit per product.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-violet-900 hover:bg-violet-50">Start {env.TRIAL_DAYS}-day free trial</Link><Link href="/login" className="rounded-lg border border-violet-400 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-900">Log in</Link></div>
      <p className="mt-4 text-xs text-violet-300">No credit card required for the trial. Cancel anytime.</p>
    </section>
    <div className="mt-8 grid gap-5 md:grid-cols-3">
      <Card><h2 className="font-semibold">Every fee, accounted for</h2><p className="mt-2 text-sm text-slate-600">Uses Etsy&apos;s actual card processing fees when they are in your export and a configurable fee model when they are not.</p></Card>
      <Card><h2 className="font-semibold">Product-level truth</h2><p className="mt-2 text-sm text-slate-600">Per-product margin, profit per labor hour, low-margin alerts, reorder alerts, and target-margin pricing suggestions.</p></Card>
      <Card><h2 className="font-semibold">Tax-time exports</h2><p className="mt-2 text-sm text-slate-600">Download product P&amp;L, orders with fees, and a Schedule C style monthly summary whenever you need them.</p></Card>
    </div>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      <Card><h2 className="font-semibold">Private by design</h2><p className="mt-2 text-sm text-slate-600">Your data lives in your own workspace, encrypted in transit and at rest, isolated from every other seller. Export or delete everything at any time from your account page.</p><Link href="/security" className="mt-3 inline-block text-sm font-semibold text-violet-700">How we protect your data →</Link></Card>
      <Card><h2 className="font-semibold">Simple pricing</h2><p className="mt-2 text-sm text-slate-600">One plan, one shop workspace, unlimited imports. Start with a free trial; upgrade from the billing page when you are ready.</p><Link href="/signup" className="mt-3 inline-block text-sm font-semibold text-violet-700">Create your workspace →</Link></Card>
    </div>
  </Shell>;
}
