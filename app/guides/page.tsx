import Link from "next/link";
import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { GUIDES } from "@/lib/guides";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Etsy profit guides — fees, pricing, shipping and margins | TrueMargin",
  description: "Plain-English guides for Etsy sellers on fees, pricing formulas, Offsite Ads, shipping costs and profit per hour. Written with the math shown.",
  alternates: { canonical: `${env.APP_URL}/guides` },
};

export default function GuidesPage() {
  return <Shell>
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Guides for Etsy sellers</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">Know what you actually keep</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">Short, numbers-first guides on Etsy fees, pricing, shipping and margins. No fluff — every one ends with a takeaway you can apply today.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => <li key={g.slug} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md">
          <Link href={`/guides/${g.slug}`} className="block">
            <h2 className="text-lg font-semibold leading-snug text-ink-900">{g.title}</h2>
            <p className="mt-2 text-sm text-ink-600">{g.description}</p>
            <p className="mt-3 text-xs text-ink-500">{g.readMinutes} min read</p>
          </Link>
        </li>)}
      </ul>
      <div className="mt-12 rounded-2xl bg-brand-50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Skip the spreadsheet</h2>
        <p className="mt-2 text-sm text-ink-600">Import your Etsy order exports and TrueMargin does every calculation in these guides for your whole shop — per product, per order, per hour.</p>
        <div className="mt-4 flex flex-wrap gap-3"><Link href="/signup?ref=guides" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Start {env.TRIAL_DAYS}-day free trial</Link><Link href="/tools/etsy-fee-calculator?ref=guides" className="rounded-full border border-brand-300 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-white">Free fee calculator</Link></div>
      </div>
    </div>
  </Shell>;
}
