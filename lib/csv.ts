import Papa from "papaparse";
import { db } from "@/lib/db";

type CsvRow = Record<string, string>;
const key = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
const value = (row: CsvRow, ...names: string[]) => Object.entries(row).find(([name]) => names.some((candidate) => key(name) === key(candidate)))?.[1]?.trim() ?? "";
const number = (row: CsvRow, ...names: string[]) => Number(value(row, ...names).replace(/[$,%\s]/g, "")) || 0;
const parseDate = (raw: string) => { const parsed = new Date(raw); return Number.isNaN(parsed.getTime()) ? new Date() : parsed; };

export function parseRows(text: string) {
  return Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true, transformHeader: (header) => header.trim() }).data;
}

export function csvHeaders(text: string) {
  return Papa.parse<Record<string, string>>(text, { header: true, preview: 1, skipEmptyLines: true }).meta.fields ?? [];
}

export async function importEtsyCsv(workspaceId: string, ordersCsv: string, itemsCsv: string) {
  const orderRows = parseRows(ordersCsv);
  const itemRows = parseRows(itemsCsv);
  const orders = new Map<string, { row: CsvRow; items: CsvRow[] }>();
  for (const row of orderRows) {
    const externalId = value(row, "Order ID", "Order Id", "order_id") || `row-${orders.size + 1}`;
    orders.set(externalId, { row, items: [] });
  }
  for (let itemIndex = 0; itemIndex < itemRows.length; itemIndex++) {
    const row = itemRows[itemIndex];
    const externalId = value(row, "Order ID", "Order Id", "order_id") || `item-row-${itemIndex + 1}`;
    if (!orders.has(externalId)) orders.set(externalId, { row, items: [] });
    orders.get(externalId)?.items.push(row);
  }
  let imported = 0;
  for (const [externalId, group] of Array.from(orders.entries())) {
    const hasProcessing = value(group.row, "Card Processing Fees", "Adjusted Card Processing Fees") !== "";
    const order = await db.order.upsert({
      where: { workspaceId_externalId: { workspaceId, externalId } },
      update: { saleDate: parseDate(value(group.row, "Sale Date")), buyer: value(group.row, "Buyer", "Full Name"), currency: value(group.row, "Currency") || "USD", orderValue: number(group.row, "Order Value", "Adjusted Order Total"), shipping: number(group.row, "Shipping"), salesTax: number(group.row, "Sales Tax"), orderTotal: number(group.row, "Order Total", "Adjusted Order Total"), status: value(group.row, "Status") || "Completed", cardProcessingFees: hasProcessing ? number(group.row, "Card Processing Fees", "Adjusted Card Processing Fees") : null, orderNet: value(group.row, "Order Net", "Adjusted Net Order Amount") ? number(group.row, "Order Net", "Adjusted Net Order Amount") : null },
      create: { workspaceId, externalId, saleDate: parseDate(value(group.row, "Sale Date")), buyer: value(group.row, "Buyer", "Full Name"), currency: value(group.row, "Currency") || "USD", orderValue: number(group.row, "Order Value", "Adjusted Order Total"), shipping: number(group.row, "Shipping"), salesTax: number(group.row, "Sales Tax"), orderTotal: number(group.row, "Order Total", "Adjusted Order Total"), status: value(group.row, "Status") || "Completed", cardProcessingFees: hasProcessing ? number(group.row, "Card Processing Fees", "Adjusted Card Processing Fees") : null, orderNet: value(group.row, "Order Net", "Adjusted Net Order Amount") ? number(group.row, "Order Net", "Adjusted Net Order Amount") : null },
    });
    await db.orderItem.deleteMany({ where: { orderId: order.id } });
    for (const row of group.items) {
      const item = await db.orderItem.create({ data: { workspaceId, orderId: order.id, externalOrderId: externalId, itemName: value(row, "Item Name") || "Untitled item", buyer: value(row, "Buyer"), quantity: number(row, "Quantity") || 1, price: number(row, "Price"), itemTotal: number(row, "Item Total"), currency: value(row, "Currency") || "USD", transactionId: value(row, "Transaction ID") || null, sku: value(row, "SKU"), variations: value(row, "Variations") } });
      const product = await db.product.findFirst({ where: { workspaceId, name: item.itemName } });
      if (!product) await db.product.create({ data: { workspaceId, name: item.itemName, sku: item.sku } });
    }
    imported++;
  }
  return { orders: imported, items: itemRows.length };
}
