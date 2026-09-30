import Link from "next/link";
import type { Metadata } from "next";
import { FeeCalculator } from "@/components/fee-calculator";
import { Shell } from "@/components/shell";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Etsy Fee Calculator 2026 — what you actually keep per sale | TrueMargin",
  description: "Free Etsy fee calculator. Enter your price and shipping to see listing, transaction, payment processing and Offsite Ads fees, plus your real profit after materials and time.",
  alternates: { canonical: `${env.APP_URL}/tools/etsy-fee-calculator` },
  openGraph: { title: "Etsy Fee Calculator — what you actually keep per sale", description: "See every Etsy fee on one sale and your true profit after shipping, materials and time.", url: `${env.APP_URL}/tools/etsy-fee-calculator`, type: "website" },
};

const FAQ = [
  ["What fees does Etsy charge per sale?", "A $0.20 listing fee per item sold, a 6.5% transaction fee on the item price plus shipping, and a payment processing fee (3% + $0.25 in the US). If the sale came from an Offsite Ad, Etsy adds 12% (shops over $10k/yr) or 15%."],
  ["Is the transaction fee charged on shipping too?", "Yes. Since 2018 the 6.5% transaction fee applies to the item price plus whatever you charge for shipping and gift wrap."],
  ["Why is my real margin lower than this?", "This calculator shows a single sale. Across a shop, refunds, discounts, free-shipping guarantees, Etsy Ads spend and unsold listing renewals all eat into the number. TrueMargin calculates it from your actual Etsy order exports."],
];

export default function FeeCalculatorPage() {
  return <Shell>
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Free tool for Etsy sellers</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">Etsy fee calculator</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">Type in one sale. See every fee Etsy takes, what the shipping label costs you, and what is actually left — before and after your materials and time.</p>
      <div className="mt-8"><FeeCalculator trialDays={env.TRIAL_DAYS} /></div>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {FAQ.map(([question, answer]) => <div key={question}><h2 className="font-semibold">{question}</h2><p className="mt-2 text-sm text-ink-600">{answer}</p></div>)}
      </section>
      <p className="mt-10 text-xs text-ink-500">Fee rates reflect Etsy&apos;s published US schedule and can change. TrueMargin is an independent tool and is not affiliated with or endorsed by Etsy, Inc. <Link href="/" className="font-semibold text-brand-700">About TrueMargin</Link></p>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }) }} />
  </Shell>;
}
