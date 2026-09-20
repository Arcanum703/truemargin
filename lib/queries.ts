import { db } from "@/lib/db";
import { calculateOrderFees } from "@/lib/fee-engine";
import { productMetrics } from "@/lib/metrics";
import { getWorkspace } from "@/lib/workspace";

export async function getDashboard() {
  const workspace = await getWorkspace();
  const [orders, products] = await Promise.all([
    db.order.findMany({ where: { workspaceId: workspace.id }, include: { items: true }, orderBy: { saleDate: "desc" } }),
    db.product.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: "asc" } }),
  ]);
  const settings = workspace.settings ?? await db.settings.create({ data: { workspaceId: workspace.id } });
  const feeSettings = { listingFee: settings.listingFee, transactionRate: settings.transactionRate, paymentRate: settings.paymentRate, paymentFixed: settings.paymentFixed, offsiteAdsEnabled: settings.offsiteAdsEnabled, offsiteAdsRate: settings.offsiteAdsRate, defaultShippingCost: settings.defaultShippingCost };
  const flagged = orders.some((order) => order.offsiteAdsAttributed);
  const fallbackCount = !flagged ? Math.ceil(orders.length * settings.estimatedOffsitePercent / 100) : 0;
  const orderMetrics = orders.map((order, index) => calculateOrderFees({ orderValue: order.orderValue, shipping: order.shipping, salesTax: order.salesTax, cardProcessingFees: order.cardProcessingFees, offsiteAdsAttributed: order.offsiteAdsAttributed, useOffsiteFallback: !flagged && index < fallbackCount, items: order.items }, feeSettings));
  const totals = orderMetrics.reduce((sum, metric) => ({ revenue: sum.revenue + metric.revenue, fees: sum.fees + metric.fees, shipping: sum.shipping + metric.shippingCost, units: sum.units + metric.units }), { revenue: 0, fees: 0, shipping: 0, units: 0 });
  const productsWithMetrics = productMetrics(products, orders, { ...feeSettings, hourlyRate: settings.hourlyRate, estimatedOffsitePercent: settings.estimatedOffsitePercent });
  const materials = productsWithMetrics.reduce((sum, product) => sum + product.materials, 0);
  const labor = productsWithMetrics.reduce((sum, product) => sum + product.labor, 0);
  const packaging = productsWithMetrics.reduce((sum, product) => sum + product.packaging, 0);
  const netProfit = totals.revenue - totals.fees - totals.shipping - materials - labor - packaging;
  return { workspace, settings, orders, products: productsWithMetrics, totals: { ...totals, materials, labor, packaging, netProfit, margin: totals.revenue ? netProfit / totals.revenue * 100 : 0 } };
}

export async function getProduct(id: string) {
  const workspace = await getWorkspace();
  const product = await db.product.findFirstOrThrow({ where: { id, workspaceId: workspace.id } });
  const orders = await db.order.findMany({ where: { workspaceId: workspace.id }, include: { items: true }, orderBy: { saleDate: "desc" } });
  const settings = workspace.settings ?? await db.settings.create({ data: { workspaceId: workspace.id } });
  const metric = productMetrics([product], orders, { listingFee: settings.listingFee, transactionRate: settings.transactionRate, paymentRate: settings.paymentRate, paymentFixed: settings.paymentFixed, offsiteAdsEnabled: settings.offsiteAdsEnabled, offsiteAdsRate: settings.offsiteAdsRate, defaultShippingCost: settings.defaultShippingCost, hourlyRate: settings.hourlyRate, estimatedOffsitePercent: settings.estimatedOffsitePercent })[0];
  const costPerUnit = product.materialCost + product.packagingCost + product.laborMinutes / 60 * settings.hourlyRate;
  const suggestedPrice = costPerUnit / Math.max(0.01, (100 - settings.targetMargin - settings.transactionRate - settings.paymentRate) / 100);
  return { workspace, settings, product, metric, costPerUnit, suggestedPrice };
}
