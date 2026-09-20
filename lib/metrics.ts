import { calculateOrderFees, type FeeSettings } from "@/lib/fee-engine";

type Item = { itemName: string; quantity: number; itemTotal: number; price: number };
type Order = { orderValue: number; shipping: number; salesTax: number; cardProcessingFees: number | null; offsiteAdsAttributed: boolean; items: Item[] };
type Product = { id: string; name: string; sku: string; materialCost: number; laborMinutes: number; packagingCost: number; stockOnHand: number; reorderPoint: number };

export function productMetrics(products: Product[], orders: Order[], settings: FeeSettings & { hourlyRate: number; estimatedOffsitePercent: number }) {
  const flagged = orders.some((order) => order.offsiteAdsAttributed);
  const fallbackCount = !flagged ? Math.ceil(orders.length * settings.estimatedOffsitePercent / 100) : 0;
  return products.map((product) => {
    const lines = orders.flatMap((order) => order.items.filter((item) => item.itemName === product.name).map((item) => ({ order, item })));
    const revenue = lines.reduce((sum, { item }) => sum + item.itemTotal, 0);
    const units = lines.reduce((sum, { item }) => sum + item.quantity, 0);
    const orderIds = lines.map(({ order }) => order).filter((order, index, all) => all.indexOf(order) === index);
    const fees = orderIds.reduce((sum, order, index) => sum + calculateOrderFees({ ...order, useOffsiteFallback: !flagged && index < fallbackCount }, settings).fees * (lines.filter((line) => line.order === order).reduce((subtotal: number, line) => subtotal + line.item.itemTotal, 0) / Math.max(0.01, order.items.reduce((subtotal: number, item) => subtotal + item.itemTotal, 0))), 0);
    const materials = units * product.materialCost;
    const labor = units * (product.laborMinutes / 60) * settings.hourlyRate;
    const packaging = units * product.packagingCost;
    const profit = revenue - fees - materials - labor - packaging;
    return { ...product, units, revenue, fees, materials, labor, packaging, cogs: materials + labor + packaging, profit, margin: revenue ? profit / revenue * 100 : 0 };
  });
}
