import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { GUIDES, getGuide } from "@/lib/guides";
import { env } from "@/lib/env";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  const url = `${env.APP_URL}/guides/${guide.slug}`;
  return {
    title: `${guide.title} | TrueMargin`,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.description, url, type: "article" },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);
  return <Shell>
    <article className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700"><Link href="/guides" className="hover:underline">Guides</Link> · {guide.readMinutes} min read</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{guide.title}</h1>
      <p className="mt-4 text-lg text-ink-600">{guide.intro}</p>
      {guide.sections.map((s) => <section key={s.heading} className="mt-10">
        <h2 className="text-xl font-semibold">{s.heading}</h2>
        {s.paragraphs.filter(Boolean).map((p) => <p key={p} className="mt-3 leading-relaxed text-ink-700">{p}</p>)}
        {s.bullets && <ul className="mt-3 list-disc space-y-2 pl-6 text-ink-700">{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
      </section>)}
      <div className="mt-12 rounded-2xl border-l-4 border-brand-600 bg-brand-50 p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Takeaway</p><p className="mt-2 font-medium text-ink-900">{guide.takeaway}</p></div>
      <div className="mt-10 rounded-2xl bg-ink-900 p-6 text-white sm:p-8">
        <h2 className="text-xl font-semibold">Do this for your whole shop in two minutes</h2>
        <p className="mt-2 text-sm text-white/80">Import your Etsy Orders and Order Items exports. TrueMargin shows fees, shipping, materials and profit per hour for every product — no spreadsheet.</p>
        <div className="mt-4 flex flex-wrap gap-3"><Link href={`/signup?ref=guide-${guide.slug}`} className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-400">Start {env.TRIAL_DAYS}-day free trial</Link><Link href="/tools/etsy-fee-calculator" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">Try the free fee calculator</Link></div>
      </div>
      <section className="mt-12"><h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">More guides</h2><ul className="mt-3 space-y-2">{others.map((g) => <li key={g.slug}><Link href={`/guides/${g.slug}`} className="font-medium text-brand-700 hover:underline">{g.title}</Link></li>)}</ul></section>
      <p className="mt-10 text-xs text-ink-500">Fee rates reflect Etsy&apos;s published US schedule as of {guide.updated} and can change. TrueMargin is an independent tool and is not affiliated with or endorsed by Etsy, Inc.</p>
    </article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, dateModified: `${guide.updated}-01`, author: { "@type": "Organization", name: "TrueMargin" }, mainEntityOfPage: `${env.APP_URL}/guides/${guide.slug}` }) }} />
  </Shell>;
}
