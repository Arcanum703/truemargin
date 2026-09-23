import { toCsv } from "@/lib/csv";
import { calculateOrderFees } from "@/lib/fee-engine";
import { isRefundedStatus } from "@/lib/order-status";
import { getDashboard } from "@/lib/queries";

export const EXPORT_TYPES = ["products", "orders", "summary"] as const;
export type ExportType = (typeof EXPORT_TYPES)[number];

export async function buildExport(type: ExportType) {
  const { products, orders, settings } = await getDashboard();
  const feeSettings = { listingFee: settings.listingFee, transactionRate: settings.transactionRate, paymentRate: settings.paymentRate, paymentFixed: settings.paymentFixed, offsiteAdsEnabled: settings.offsiteAdsEnabled, offsiteAdsRate: settings.offsiteAdsRate, defaultShippingCost: settings.defaultShippingCost };
  if (type === "products") {
    return { filename: "truemargin-product-pnl.csv", csv: toCsv([["Product", "SKU", "Units", "Revenue", "Fees", "COGS", "Profit", "Margin %"], ...products.map((product) => [product.name, product.sku, product.units, product.revenue.toFixed(2), product.fees.toFixed(2), product.cogs.toFixed(2), product.profit.toFixed(2), product.margin.toFixed(1)])]) };
  }
  if (type === "orders") {
    const flagged = orders.some((order) => order.offsiteAdsAttributed);
    const fallbackCount = !flagged ? Math.ceil(orders.length * settings.estimatedOffsitePercent / 100) : 0;
    const rows = orders.map((order, index) => {
      const fees = calculateOrderFees({ orderValue: order.orderValue, shipping: order.shipping, salesTax: order.salesTax, cardProcessingFees: order.cardProcessingFees, offsiteAdsAttributed: order.offsiteAdsAttributed, useOffsiteFallback: !flagged && index < fallbackCount, items: order.items }, feeSettings);
      return [order.externalId, order.saleDate.toISOString().slice(0, 10), order.buyer, order.orderTotal.toFixed(2), fees.fees.toFixed(2), fees.processingFees.toFixed(2), fees.offsiteAds.toFixed(2), order.status, isRefundedStatus(order.status) ? "REFUNDED" : ""];
    });
    return { filename: "truemargin-orders.csv", csv: toCsv([["Order ID", "Sale Date", "Buyer", "Order Total", "Fees", "Processing Fees", "Offsite Ads", "Status", "Refund Flag"], ...rows]) };
  }
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
  const summaryRows: (string | number)[][] = Array.from(months.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, row]) => [month, row.gross.toFixed(2), row.refunds.toFixed(2), row.fees.toFixed(2), row.shipping.toFixed(2), row.materials.toFixed(2), row.labor.toFixed(2), (row.gross - row.refunds - row.fees - row.shipping - row.materials - row.labor).toFixed(2)]);
  const totals = summaryRows.reduce<number[]>((sum, row) => row.slice(1).map((value, index) => (sum[index] ?? 0) + Number(value)), []);
  summaryRows.push(["TOTALS", ...totals.map((value) => value.toFixed(2))]);
  return { filename: "truemargin-year-summary.csv", csv: toCsv([["Month", "Gross Receipts", "Refunds", "Etsy Fees", "Shipping", "Materials", "Labor", "Net"], ...summaryRows]) };
}
