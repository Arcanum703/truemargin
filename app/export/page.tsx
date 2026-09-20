import { calculateOrderFees } from "@/lib/fee-engine";
import { isRefundedStatus } from "@/lib/order-status";
import { getDashboard } from "@/lib/queries";
import { Card, Shell } from "@/components/shell";

const csv = (rows: (string | number)[][]) => rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");

export default async function ExportPage() {
  const { products, orders, settings } = await getDashboard();
  const feeSettings = { listingFee: settings.listingFee, transactionRate: settings.transactionRate, paymentRate: settings.paymentRate, paymentFixed: settings.paymentFixed, offsiteAdsEnabled: settings.offsiteAdsEnabled, offsiteAdsRate: settings.offsiteAdsRate, defaultShippingCost: settings.defaultShippingCost };
  const flagged = orders.some((order) => order.offsiteAdsAttributed);
  const fallbackCount = !flagged ? Math.ceil(orders.length * settings.estimatedOffsitePercent / 100) : 0;
  const orderRows = orders.map((order, index) => {
    const fees = calculateOrderFees({ orderValue: order.orderValue, shipping: order.shipping, salesTax: order.salesTax, cardProcessingFees: order.cardProcessingFees, offsiteAdsAttributed: order.offsiteAdsAttributed, useOffsiteFallback: !flagged && index < fallbackCount, items: order.items }, feeSettings);
    return [order.externalId, order.saleDate.toISOString().slice(0, 10), order.buyer, order.orderTotal.toFixed(2), fees.fees.toFixed(2), fees.processingFees.toFixed(2), fees.offsiteAds.toFixed(2), order.status, isRefundedStatus(order.status) ? "REFUNDED" : ""];
  });
  const months = new Map<string, { gross: number; refunds: number; fees: number; shipping: number; materials: number; labor: number }>();
  for (const order of orders) {
    const month = order.saleDate.toISOString().slice(0, 7);
    const row = months.get(month) ?? { gross: 0, refunds: 0, fees: 0, shipping: 0, materials: 0, labor: 0 };
    if (isRefundedStatus(order.status)) row.refunds += order.orderTotal;
    else {
      const fees = calculateOrderFees({ orderValue: order.orderValue, shipping: order.shipping, salesTax: order.salesTax, cardProcessingFees: order.cardProcessingFees, offsiteAdsAttributed: order.offsiteAdsAttributed, items: order.items }, feeSettings);
      row.gross += fees.revenue; row.fees += fees.fees; row.shipping += fees.shippingCost;
      for (const item of order.items) {
        const product = products.find((candidate) => candidate.name === item.itemName);
        row.materials += item.quantity * (product?.materialCost ?? 0);
        row.labor += item.quantity * ((product?.laborMinutes ?? 0) / 60) * settings.hourlyRate;
      }
    }
    months.set(month, row);
  }
  const summaryRows = Array.from(months.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, row]) => [month, row.gross.toFixed(2), row.refunds.toFixed(2), row.fees.toFixed(2), row.shipping.toFixed(2), row.materials.toFixed(2), row.labor.toFixed(2), (row.gross - row.refunds - row.fees - row.shipping - row.materials - row.labor).toFixed(2)]);
  const totals = summaryRows.reduce((sum, row) => row.slice(1).map((value, index) => (sum[index] ?? 0) + Number(value)), [] as number[]);
  summaryRows.push(["TOTALS", ...totals.map((value) => value.toFixed(2))]);
  const productCsv = encodeURIComponent(csv([["Product", "Units", "Revenue", "Fees", "COGS", "Profit", "Margin"], ...products.map((product) => [product.name, product.units, product.revenue.toFixed(2), product.fees.toFixed(2), product.cogs.toFixed(2), product.profit.toFixed(2), product.margin.toFixed(1)])]));
  const ordersCsv = encodeURIComponent(csv([["Order ID", "Sale Date", "Buyer", "Order Total", "Fees", "Processing Fees", "Offsite Ads", "Status", "Refund Flag"], ...orderRows]));
  const summaryCsv = encodeURIComponent(csv([["Month", "Gross Receipts", "Refunds", "Etsy Fees", "Shipping", "Materials", "Labor", "Net"], ...summaryRows]));
  return <Shell title="Tax-time exports"><div className="grid gap-5 md:grid-cols-3"><Card><h2 className="font-semibold">Monthly P&amp;L by product</h2><p className="mt-2 text-sm text-slate-500">Export the current product-level revenue, fees, COGS, profit, and margin as CSV.</p><a download="truemargin-product-pnl.csv" href={`data:text/csv,${productCsv}`} className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Download product P&amp;L</a></Card><Card><h2 className="font-semibold">Full orders with fees</h2><p className="mt-2 text-sm text-slate-500">{orders.length} imported orders are ready for reconciliation.</p><a download="truemargin-orders.csv" href={`data:text/csv,${ordersCsv}`} className="mt-4 inline-block border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700">Download orders CSV</a></Card><Card><h2 className="font-semibold">Year summary (Schedule C style)</h2><p className="mt-2 text-sm text-slate-500">Monthly gross receipts, refunds, Etsy fees, shipping, materials, labor, and net.</p><a download="truemargin-year-summary.csv" href={`data:text/csv,${summaryCsv}`} className="mt-4 inline-block rounded-lg border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700">Download year summary</a></Card></div></Shell>;
}
