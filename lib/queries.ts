import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { calculateOrderFees } from "@/lib/fee-engine";
import { productMetrics } from "@/lib/metrics";
import { isRefundedStatus } from "@/lib/order-status";
import { requireWorkspace } from "@/lib/auth";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(value: string | undefined, suffix: string) {
  if (!value || !ISO_DAY.test(value)) return undefined;
  const date = new Date(`${value}${suffix}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function getDashboard(options: { period?: string; from?: string; to?: string } = {}) {
  const context = await requireWorkspace();
  const { workspace } = context;
  const saleDate: { gte?: Date; lte?: Date } = {};
  if (options.period === "month") {
    const now = new Date();
    saleDate.gte = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  } else if (options.period === "30") {
    saleDate.gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  } else if (options.period === "custom") {
    const from = parseDay(options.from, "T00:00:00.000Z");
    const to = parseDay(options.to, "T23:59:59.999Z");
    if (from) saleDate.gte = from;
    if (to) saleDate.lte = to;
  }
  const [orders, products] = await Promise.all([
    db.order.findMany({ where: { workspaceId: workspace.id, ...(Object.keys(saleDate).length ? { saleDate } : {}) }, include: { items: true }, orderBy: { saleDate: "desc" } }),
    db.product.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: "asc" } }),
  ]);
  const settings = workspace.settings;
  const feeSettings = { listingFee: settings.listingFee, transactionRate: settings.transactionRate, paymentRate: settings.paymentRate, paymentFixed: settings.paymentFixed, offsiteAdsEnabled: settings.offsiteAdsEnabled, offsiteAdsRate: settings.offsiteAdsRate, defaultShippingCost: settings.defaultShippingCost };
  const activeOrders = orders.filter((order) => !isRefundedStatus(order.status));
  const flagged = activeOrders.some((order) => order.offsiteAdsAttributed);
  const fallbackCount = !flagged ? Math.ceil(activeOrders.length * settings.estimatedOffsitePercent / 100) : 0;
  const orderMetrics = activeOrders.map((order, index) => calculateOrderFees({ orderValue: order.orderValue, shipping: order.shipping, salesTax: order.salesTax, cardProcessingFees: order.cardProcessingFees, offsiteAdsAttributed: order.offsiteAdsAttributed, useOffsiteFallback: !flagged && index < fallbackCount, items: order.items }, feeSettings));
  const totals = orderMetrics.reduce((sum, metric) => ({ revenue: sum.revenue + metric.revenue, fees: sum.fees + metric.fees, shipping: sum.shipping + metric.shippingCost, units: sum.units + metric.units }), { revenue: 0, fees: 0, shipping: 0, units: 0 });
  const productsWithMetrics = productMetrics(products, orders, { ...feeSettings, hourlyRate: settings.hourlyRate, estimatedOffsitePercent: settings.estimatedOffsitePercent });
  const materials = productsWithMetrics.reduce((sum, product) => sum + product.materials, 0);
  const labor = productsWithMetrics.reduce((sum, product) => sum + product.labor, 0);
  const packaging = productsWithMetrics.reduce((sum, product) => sum + product.packaging, 0);
  const netProfit = totals.revenue - totals.fees - totals.shipping - materials - labor - packaging;
  const refunds = orders.filter((order) => isRefundedStatus(order.status));
  return { context, workspace, settings, orders, refunds, products: productsWithMetrics, totals: { ...totals, materials, labor, packaging, netProfit, margin: totals.revenue ? netProfit / totals.revenue * 100 : 0 } };
}

export async function getProduct(id: string) {
  const context = await requireWorkspace();
  const { workspace } = context;
  const product = await db.product.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!product) notFound();
  const orders = await db.order.findMany({ where: { workspaceId: workspace.id }, include: { items: true }, orderBy: { saleDate: "desc" } });
  const settings = workspace.settings;
  const metric = productMetrics([product], orders, { listingFee: settings.listingFee, transactionRate: settings.transactionRate, paymentRate: settings.paymentRate, paymentFixed: settings.paymentFixed, offsiteAdsEnabled: settings.offsiteAdsEnabled, offsiteAdsRate: settings.offsiteAdsRate, defaultShippingCost: settings.defaultShippingCost, hourlyRate: settings.hourlyRate, estimatedOffsitePercent: settings.estimatedOffsitePercent })[0];
  const shippingPerUnit = metric.units ? metric.shipping / metric.units : settings.defaultShippingCost;
  const costPerUnit = product.materialCost + product.packagingCost + product.laborMinutes / 60 * settings.hourlyRate + shippingPerUnit;
  const suggestedPrice = (costPerUnit + settings.listingFee + settings.paymentFixed) / Math.max(0.01, (100 - settings.targetMargin - settings.transactionRate - settings.paymentRate) / 100);
  return { context, workspace, settings, product, metric, costPerUnit, shippingPerUnit, suggestedPrice };
}
