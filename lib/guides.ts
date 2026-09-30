export type GuideSection = { heading: string; paragraphs: string[]; bullets?: string[] };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  readMinutes: number;
  updated: string;
  intro: string;
  sections: GuideSection[];
  takeaway: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "etsy-fees-explained",
    title: "Etsy fees explained (2026): every fee on one $30 sale",
    description: "Listing, transaction, payment processing, Offsite Ads, currency conversion and subscription fees — what each one is, when it applies, and what a $30 sale actually leaves you.",
    readMinutes: 6,
    updated: "2026-09",
    intro: "Etsy publishes its fee schedule, but the fees stack in ways that surprise most sellers. Here is every fee applied to a single US sale, in the order it hits your Payment account.",
    sections: [
      { heading: "The fees on every sale", paragraphs: ["Three fees apply to every order, no exceptions:"], bullets: ["Listing fee: $0.20 per item sold (and $0.20 every time a listing auto-renews after four months, sold or not).", "Transaction fee: 6.5% of the item price plus shipping and gift-wrap you charge the buyer.", "Payment processing: 3% + $0.25 of the total the buyer pays (US rate; other countries range from 3% to 6.5%)."] },
      { heading: "The fees that only sometimes apply", paragraphs: ["These are the ones that make two sellers with identical prices end up with different margins."], bullets: ["Offsite Ads: 15% of the order (12% if your shop made over $10,000 in the last 12 months) when a buyer clicks an Etsy-placed ad on Google, Facebook, Pinterest or Instagram within 30 days. Mandatory above $10k/yr.", "Currency conversion: 2.5% when your listing currency differs from your Payment account currency.", "Regulatory operating fee: a percentage of the item price in some countries (e.g. UK, France, Italy, Spain, Turkey).", "Etsy Plus: $10/month if you subscribe.", "Etsy Ads: whatever daily budget you set — a cost, not a fee, but it comes out of the same pocket."] },
      { heading: "Worked example: a $30 item with $5 shipping", paragraphs: ["Buyer pays $35. Transaction fee is 6.5% of $35 = $2.28. Payment processing is 3% of $35 + $0.25 = $1.30. Listing fee $0.20. Total Etsy fees: $3.78, or 10.8% of what the buyer paid.", "If that order came through an Offsite Ad, add 15% of $35 = $5.25. Total: $9.03, or 25.8%. Same product, same price, more than double the fees.", "Now subtract the shipping label. If it cost you $6.20, you kept $35 − $3.78 − $6.20 = $25.02 before materials and your time — on the ad-driven order only $19.77."] },
      { heading: "The mistake almost everyone makes", paragraphs: ["Sellers quote \"Etsy takes about 6.5%\". It is closer to 11% on a normal order and 26% on an Offsite Ads order, and the transaction fee applies to shipping too — so \"free shipping\" baked into the item price is also being charged 6.5%.", "The only way to know your real number is to calculate it across all your orders, not one listing. Your Etsy order export contains every fee per order; that is what a profit tracker reads."] },
    ],
    takeaway: "Budget 11% for fees on an ordinary order and 26% when Offsite Ads are involved. Anything less and your margin is a guess.",
  },
  {
    slug: "is-my-etsy-shop-profitable",
    title: "Is my Etsy shop actually profitable? A 15-minute check",
    description: "Revenue is not profit. Here is the exact order to subtract fees, shipping, materials, labor and ads from your Etsy sales to find out whether you are making money.",
    readMinutes: 7,
    updated: "2026-09",
    intro: "Most sellers know their sales number. Very few know their profit number, because Etsy shows revenue on the dashboard and scatters the costs across three different screens. This is the check to run once, honestly.",
    sections: [
      { heading: "Step 1 — download the two exports", paragraphs: ["In Shop Manager go to Settings → Options → Download Data. Download \"Orders\" and \"Order Items\" as CSV for the same date range (start with the last 90 days). The Orders file has the money per order — item total, shipping, discounts, and every fee. The Order Items file has quantities per listing."] },
      { heading: "Step 2 — subtract in this order", paragraphs: ["Work down this list for the whole period, not one sale:"], bullets: ["Gross sales (item price + shipping the buyer paid − discounts and refunds).", "− Etsy fees (listing, transaction, processing, Offsite Ads, currency conversion). All of these are columns in the Orders export.", "= What Etsy deposited. This is the number many sellers mistake for profit.", "− Shipping labels you paid for (Etsy label cost, or your carrier receipts).", "− Materials and packaging per item sold × quantity.", "− Etsy Ads spend for the period (Marketing → Etsy Ads).", "= Profit before your time.", "− Your hours × the hourly rate you would accept from an employer.", "= True profit."] },
      { heading: "Step 3 — read the result", paragraphs: ["If profit before your time is negative, prices are the problem, not volume — selling more will lose more. If profit before your time is positive but true profit is negative, the shop is paying you less than minimum wage; decide whether that is fine for now (hobby, growth phase) or not.", "Then do the same per product. Almost every shop has one or two listings that lose money on every sale and a couple that carry the shop. Those are the ones to reprice or drop."] },
      { heading: "Common blind spots", paragraphs: [""], bullets: ["Free shipping: the label cost is now yours, and the 6.5% fee still applies to the price you raised to cover it.", "Refunds and cancelled orders: fees on the item are refunded, but the payment processing fee usually is not.", "Sample and thank-you extras: count them as materials.", "Listing renewals for items that did not sell: $0.20 each, every four months, pure cost."] },
    ],
    takeaway: "Run the subtraction on 90 days of exports, then per product. Profit per product — not shop revenue — tells you what to change.",
  },
  {
    slug: "etsy-offsite-ads-worth-it",
    title: "Etsy Offsite Ads: are they worth it? The margin math",
    description: "The 12% or 15% Offsite Ads fee only makes sense above a certain margin. Here is how to calculate your break-even and what to do if you cannot opt out.",
    readMinutes: 5,
    updated: "2026-09",
    intro: "Offsite Ads are the fee sellers argue about most, because Etsy charges it only on the sales it drove — and makes it mandatory once your shop passes $10,000 a year. Whether it is worth it is pure arithmetic.",
    sections: [
      { heading: "How the fee works", paragraphs: ["Etsy advertises your listings on Google, Facebook, Instagram, Pinterest and Bing at its own expense. If a shopper clicks one of those ads and buys anything from your shop within 30 days, Etsy charges 15% of that order total (item + shipping) — 12% if your shop made over $10,000 in the previous 365 days. The fee is capped at $100 per order. Shops under $10k can opt out; shops over $10k cannot."] },
      { heading: "The break-even test", paragraphs: ["Take one product. Work out your margin after Etsy's ordinary fees, shipping and materials — say it is 35% on a $40 order, so you keep $14.", "An Offsite Ads sale takes another 15% of $40 = $6. You keep $8, a 20% margin. Still positive, so the sale is worth having — you would not have had it otherwise.", "But if the product margin is 20%, the Offsite Ads sale leaves 5%. At 15% margin it leaves nothing. Any product with a margin under about 15% loses money on every Offsite Ads sale."] },
      { heading: "If you are under $10k: opt out or not?", paragraphs: ["Opt in if your typical margin after all costs is above 30% and you want volume. Opt out if your margins are thin, your items are cheap (the fee on a $12 sale is small but the margin is usually already tiny), or you are at capacity and would rather sell fewer items at full margin."] },
      { heading: "If you are over $10k: you cannot opt out, so price for it", paragraphs: ["Look at what share of your orders are attributed to Offsite Ads (the Orders export tags them). If it is 10% of orders, the fee averages about 1.2–1.5% across all sales — build that into every price. If it is 30%, you are effectively paying a 4–5% shop-wide fee and need prices to reflect it.", "Also check which products get the most Offsite Ads sales. Often they are your cheapest listings, where the fee hurts most; raising those prices by a dollar or two usually costs few sales."] },
    ],
    takeaway: "Offsite Ads are worth it on products with margins above ~30% and a loss on anything under ~15%. Know your per-product margin before deciding — or before Etsy decides for you.",
  },
  {
    slug: "etsy-pricing-formula",
    title: "The Etsy pricing formula that includes fees, shipping and your time",
    description: "Cost × 2 is not a pricing strategy. A formula that works backwards from the margin you want, the fees Etsy will charge, and the hours you put in.",
    readMinutes: 6,
    updated: "2026-09",
    intro: "The usual advice — materials × 2 for wholesale, × 4 for retail — was written for craft fairs, not for a marketplace that takes 11–26% and a shipping label that costs more than your materials. Here is a formula that starts from what you want to keep.",
    sections: [
      { heading: "Step 1 — know your cost per item", paragraphs: ["Cost = materials + packaging + (minutes to make ÷ 60 × your hourly rate) + shipping label cost you absorb. Be honest about the minutes: include photographing, listing and packing, spread across the units you make."] },
      { heading: "Step 2 — decide the margin you want", paragraphs: ["Margin is profit as a share of price. 30–40% is a sustainable range for handmade; below 20% one refund or one Offsite Ads sale wipes the profit out."] },
      { heading: "Step 3 — work backwards through the fees", paragraphs: ["Etsy's fees are percentages of the price, so you cannot just add them on. Use:", "Price = (Cost + fixed fees) ÷ (1 − fee rate − target margin)", "For a US seller with no Offsite Ads: fixed fees = $0.20 + $0.25 = $0.45, fee rate = 6.5% + 3% = 9.5%. For a $9 cost and 35% target: Price = 9.45 ÷ (1 − 0.095 − 0.35) = 9.45 ÷ 0.555 = $17.03.", "If you are over $10k and 25% of your orders come through Offsite Ads, add the averaged fee (0.25 × 12% = 3%) to the fee rate: 9.45 ÷ 0.525 = $18.00."] },
      { heading: "Step 4 — check it against the market, then adjust the product, not the margin", paragraphs: ["If the formula price is above what comparable listings sell for, the fix is usually on the cost side: fewer minutes, cheaper packaging, a lighter parcel. Cutting your margin instead just means working for free at scale.", "Revisit prices whenever a supplier, carrier or Etsy changes rates. The Etsy fee change from 5% to 6.5% in 2022 alone cut a 30% margin to 28.5% for sellers who did nothing."] },
    ],
    takeaway: "Price = (cost + $0.45) ÷ (1 − 0.095 − target margin). Put your real numbers in and the price stops being a guess.",
  },
  {
    slug: "etsy-shipping-cost-profit",
    title: "How shipping quietly eats Etsy profit (and how to stop it)",
    description: "Free shipping, underpriced labels and the 6.5% fee on shipping are the three biggest hidden costs in most Etsy shops. How to measure and fix them.",
    readMinutes: 5,
    updated: "2026-09",
    intro: "In most shops we look at, shipping is the largest cost after Etsy fees — and the one sellers estimate worst, because the label price varies with every parcel while the shipping charge stays fixed.",
    sections: [
      { heading: "Three ways shipping costs you", paragraphs: [""], bullets: ["The label itself: what you pay USPS/Royal Mail/DHL, which rises every January.", "The fee on shipping: Etsy's 6.5% transaction fee applies to the shipping you charge the buyer. Charge $5 shipping and $0.33 of it is a fee.", "Free shipping: if you offer it (or Etsy's $35+ US free-shipping guarantee kicks in) you pay the full label and also pay 6.5% on the higher item price you set to cover it."] },
      { heading: "Measure it: shipping charged vs shipping paid", paragraphs: ["From your Orders export, total the \"Shipping\" column the buyer paid. From Etsy labels (or your carrier), total what you actually paid. The gap, per order, is your shipping profit or loss. Shops routinely find they are losing $1–3 per order here without noticing, because each label is a small number."] },
      { heading: "Fix it", paragraphs: [""], bullets: ["Weigh finished, packed products and use calculated shipping, not a flat rate you set two years ago.", "For free-shipping listings, add the average label cost plus 7% (to cover the fee on it) to the item price — not just the label cost.", "Lighter packaging often saves more than any coupon. Moving a parcel one weight tier down can save $1+ per order.", "Track shipping profit per product. A heavy, cheap product can lose money on shipping alone while looking fine on item margin."] },
    ],
    takeaway: "Compare shipping charged to shipping paid across a month of orders. If the gap is negative, fix packaging and pricing before spending a cent on ads.",
  },
  {
    slug: "etsy-profit-per-hour",
    title: "Profit per hour: the Etsy metric that tells you what to make more of",
    description: "Margin says whether a product makes money. Profit per hour says whether it is worth your time. How to calculate it and use it to decide what to list.",
    readMinutes: 4,
    updated: "2026-09",
    intro: "Two products can both have a 40% margin and be wildly different businesses: one takes 10 minutes to make, the other two hours. Margin does not see that. Profit per hour does.",
    sections: [
      { heading: "The calculation", paragraphs: ["Profit per hour = (price − Etsy fees − shipping cost − materials) ÷ hours to make one.", "A $24 print that costs $2 in materials, $3 in fees and $1.50 in shipping, and takes 10 minutes: $17.50 ÷ 0.167 h = $105/hour. A $60 knitted piece with $12 materials, $7 fees, $6 shipping and 3 hours: $35 ÷ 3 = $11.67/hour. The knitted piece has the higher profit per sale and the higher margin — and pays you a tenth as much."] },
      { heading: "What to do with it", paragraphs: [""], bullets: ["Rank every product by profit per hour. The top few are what to make more of, photograph better and advertise.", "Products under your minimum acceptable rate need a price rise, a faster process, or a quiet retirement.", "When you are out of hours (not out of demand), profit per hour — not sales count — is the number to optimise.", "Check it after any price change: raising the knitted piece to $75 moves it to $16.67/hour; that is the kind of decision this metric makes obvious."] },
      { heading: "Track minutes honestly", paragraphs: ["Time three units and take the average; include packing. Most makers underestimate by 30–50%. Once you have minutes per product, the metric updates itself as sales come in."] },
    ],
    takeaway: "Rank products by profit per hour, not by sales or margin. It is the only metric that accounts for the one thing you cannot buy more of.",
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}
