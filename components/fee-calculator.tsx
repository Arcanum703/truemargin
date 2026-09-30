"use client";

import Link from "next/link";
import { useState } from "react";
import { calculateOrderFees, type FeeSettings } from "@/lib/fee-engine";
import { Money } from "@/components/shell";

const ETSY_US: FeeSettings = { listingFee: 0.2, transactionRate: 6.5, paymentRate: 3, paymentFixed: 0.25, offsiteAdsEnabled: true, offsiteAdsRate: 15, defaultShippingCost: 0 };

type Field = { key: "price" | "shippingCharged" | "shippingCost" | "materials" | "minutes" | "hourly"; label: string; hint: string; prefix?: string };
const FIELDS: Field[] = [
  { key: "price", label: "Item price", hint: "What the buyer pays for the item", prefix: "$" },
  { key: "shippingCharged", label: "Shipping charged to buyer", hint: "0 for free shipping", prefix: "$" },
  { key: "shippingCost", label: "What the label actually costs you", hint: "Postage + mailer", prefix: "$" },
  { key: "materials", label: "Materials & packaging", hint: "Optional — per item", prefix: "$" },
  { key: "minutes", label: "Minutes to make", hint: "Optional" },
  { key: "hourly", label: "What your hour is worth", hint: "Optional", prefix: "$" },
];

export function FeeCalculator({ trialDays }: { trialDays: number }) {
  const [values, setValues] = useState<Record<Field["key"], string>>({ price: "25", shippingCharged: "0", shippingCost: "4.50", materials: "", minutes: "", hourly: "" });
  const [offsite, setOffsite] = useState(false);
  const num = (key: Field["key"]) => Math.max(0, Number(values[key]) || 0);

  const price = num("price");
  const fees = calculateOrderFees({ orderValue: price, shipping: num("shippingCharged"), items: [{ quantity: 1, itemTotal: price }], offsiteAdsAttributed: offsite }, ETSY_US);
  const labor = (num("minutes") / 60) * num("hourly");
  const afterEtsy = price + num("shippingCharged") - fees.fees - num("shippingCost");
  const profit = afterEtsy - num("materials") - labor;
  const gross = price + num("shippingCharged");
  const margin = gross > 0 ? (profit / gross) * 100 : 0;
  const keepPct = gross > 0 ? (afterEtsy / gross) * 100 : 0;

  const rows: Array<[string, number]> = [
    ["Listing fee", fees.listingFees],
    ["Transaction fee (6.5% of item + shipping)", fees.transactionFees],
    ["Payment processing (3% + $0.25)", fees.processingFees],
    ...(offsite ? [["Offsite Ads fee (15%)", fees.offsiteAds] as [string, number]] : []),
    ["Shipping label", num("shippingCost")],
  ];

  return <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
    <div className="space-y-4 rounded-2xl border border-ink-100 bg-white p-5">
      {FIELDS.map((field) => <div key={field.key}>
        <label htmlFor={`fc-${field.key}`}>{field.label}</label>
        <div className="relative">{field.prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">{field.prefix}</span>}
          <input id={`fc-${field.key}`} type="number" inputMode="decimal" min="0" step="any" value={values[field.key]} placeholder="0" className={field.prefix ? "pl-7" : ""} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} /></div>
        <p className="mt-1 text-xs text-ink-500">{field.hint}</p>
      </div>)}
      <label className="flex items-center gap-2 text-sm font-normal text-ink-700"><input type="checkbox" checked={offsite} onChange={(event) => setOffsite(event.target.checked)} /> This sale came from an Offsite Ad (15% fee)</label>
    </div>

    <div className="space-y-4">
      <div className="rounded-2xl bg-brand-600 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">You keep after Etsy fees &amp; shipping</p>
        <p className="mt-2 text-5xl font-semibold tracking-tight"><Money value={afterEtsy} /></p>
        <p className="mt-1 text-sm text-brand-50/90">{keepPct.toFixed(0)}% of the {gross ? <Money value={gross} /> : "$0.00"} the buyer paid. Etsy&apos;s fees alone: <Money value={fees.fees} />.</p>
        {(num("materials") > 0 || labor > 0) && <div className="mt-5 border-t border-white/20 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">True profit after your costs</p>
          <p className={`mt-1 text-3xl font-semibold ${profit < 0 ? "text-red-200" : ""}`}><Money value={profit} /> <span className="text-base font-medium text-brand-100">{margin.toFixed(1)}% margin</span></p>
          {labor > 0 && <p className="mt-1 text-sm text-brand-50/90">That is <Money value={profit / (num("minutes") / 60)} /> per hour of your time.</p>}
        </div>}
      </div>
      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <h2 className="font-semibold">Where the money goes</h2>
        <table className="mt-3 w-full text-sm"><tbody>
          {rows.map(([label, value]) => <tr key={label} className="border-t border-ink-100"><td className="py-2 text-ink-600">{label}</td><td className="py-2 text-right font-medium">-<Money value={value} /></td></tr>)}
          {num("materials") > 0 && <tr className="border-t border-ink-100"><td className="py-2 text-ink-600">Materials &amp; packaging</td><td className="py-2 text-right font-medium">-<Money value={num("materials")} /></td></tr>}
          {labor > 0 && <tr className="border-t border-ink-100"><td className="py-2 text-ink-600">Your time</td><td className="py-2 text-right font-medium">-<Money value={labor} /></td></tr>}
        </tbody></table>
        <p className="mt-3 text-xs text-ink-500">Uses Etsy&apos;s current US fee schedule. Sales tax collected by Etsy is excluded because Etsy remits it, not you. Regulatory operating fees in some countries are not included.</p>
      </div>
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
        <p className="font-semibold text-brand-900">This is one sale. Want it for every order in your shop?</p>
        <p className="mt-1 text-sm text-ink-700">Upload the two CSVs Etsy already gives you and TrueMargin does this math per product across your whole history — including which bestsellers are quietly losing money.</p>
        <Link href="/signup?ref=fee-calculator" className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">See my whole shop — free {trialDays}-day trial</Link>
      </div>
    </div>
  </div>;
}
