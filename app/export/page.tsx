import { calculateOrderFees } from "@/lib/fee-engine";
import { getDashboard } from "@/lib/queries";
import { Card, Shell } from "@/components/shell";

export default async function ExportPage() {
  const { products, orders, settings } = await getDashboard();
  const feeSettings = { listingFee: settings.listingFee, transactionRate: settings.transactionRate, paymentRate: settings.paymentRate, paymentFixed: settings.paymentFixed, offsiteAdsEnabled: settings.offsiteAdsEnabled, offsiteAdsRate: settings.offsiteAdsRate, defaultShippingCost: settings.defaultShippingCost };
  const flagged = orders.some((order) => order.offsiteAdsAttributed);
  const fallbackCount = !flagged ? Math.ceil(orders.length * settings.estimatedOffsitePercent / 100) : 0;
  const orderRows = orders.map((order, index) => {
    const fees = calculateOrderFees({ orderValue: order.orderValue, shipping: order.shipping, salesTax: order.salesTax, cardProcessingFees: order.cardProcessingFees, offsiteAdsAttributed: order.offsiteAdsAttributed, useOffsiteFallback: !flagged && index < fallbackCount, items: order.items }, feeSettings);
    return [order.externalId, order.saleDate.toISOString().slice(0, 10), order.buyer, order.orderTotal.toFixed(2), fees.fees.toFixed(2), fees.processingFees.toFixed(2), fees.offsiteAds.toFixed(2), order.status];
  });
  return <Shell title="Tax-time exports"><div className="grid gap-5 md:grid-cols-2"><Card><h2 className="font-semibold">Monthly P&amp;L by product</h2><p className="mt-2 text-sm text-slate-500">Export the current product-level revenue, fees, COGS, profit, and margin as CSV.</p><a download="truemargin-product-pnl.csv" href={`data:text/csv,Product,Units,Revenue,Fees,COGS,Profit,Margin%0A${products.map((product) => [product.name, product.units, product.revenue.toFixed(2), product.fees.toFixed(2), product.cogs.toFixed(2), product.profit.toFixed(2), product.margin.toFixed(1)].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("%0A")}`} className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Download product P&amp;L</a></Card><Card><h2 className="font-semibold">Full orders with fees</h2><p className="mt-2 text-sm text-slate-500">{orders.length} imported orders are ready for reconciliation.</p><a download="truemargin-orders.csv" href={`data:text/csv,Order%20ID,Sale%20Date,Buyer,Order%20Total,Fees,Processing%20Fees,Offsite%20Ads,Status%0A${orderRows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("%0A")}`} className="mt-4 inline-block border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700">Download orders CSV</a></Card></div></Shell>;
}
