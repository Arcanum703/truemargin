import Papa from "papaparse";
import { db } from "@/lib/db";
import { UserFacingError } from "@/lib/security";

export const CSV_MAX_BYTES = 5 * 1024 * 1024;
export const CSV_MAX_ROWS = 25_000;
const CELL_MAX = 500;

type CsvRow = Record<string, string>;
const key = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
const clean = (raw: string | undefined) => (raw ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, CELL_MAX);
const value = (row: CsvRow, ...names: string[]) => clean(Object.entries(row).find(([name]) => names.some((candidate) => key(name) === key(candidate)))?.[1]);
const number = (row: CsvRow, ...names: string[]) => { const parsed = Number(value(row, ...names).replace(/[$,%\s]/g, "")); return Number.isFinite(parsed) ? Math.max(-1e9, Math.min(1e9, parsed)) : 0; };
const parseDate = (raw: string) => { const parsed = new Date(raw); return Number.isNaN(parsed.getTime()) ? new Date() : parsed; };

export function assertCsvSize(text: string, label: string) {
  if (Buffer.byteLength(text, "utf8") > CSV_MAX_BYTES) throw new UserFacingError(`${label} is larger than 5 MB. Split the export by date range and import in batches.`);
}

export function parseRows(text: string) {
  const parsed = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true, transformHeader: (header) => header.trim().slice(0, 100) });
  if (parsed.data.length > CSV_MAX_ROWS) throw new UserFacingError(`CSV has more than ${CSV_MAX_ROWS.toLocaleString()} rows. Split the export by date range and import in batches.`);
  return parsed.data;
}

export function csvHeaders(text: string) {
  return Papa.parse<Record<string, string>>(text, { header: true, preview: 1, skipEmptyLines: true }).meta.fields ?? [];
}

const orderData = (row: CsvRow) => {
  const hasProcessing = value(row, "Card Processing Fees", "Adjusted Card Processing Fees") !== "";
  return {
    saleDate: parseDate(value(row, "Sale Date")),
    buyer: value(row, "Buyer", "Full Name"),
    currency: value(row, "Currency") || "USD",
    orderValue: number(row, "Order Value", "Adjusted Order Total"),
    shipping: number(row, "Shipping"),
    salesTax: number(row, "Sales Tax"),
    orderTotal: number(row, "Order Total", "Adjusted Order Total"),
    status: value(row, "Status") || "Completed",
    cardProcessingFees: hasProcessing ? number(row, "Card Processing Fees", "Adjusted Card Processing Fees") : null,
    orderNet: value(row, "Order Net", "Adjusted Net Order Amount") ? number(row, "Order Net", "Adjusted Net Order Amount") : null,
  };
};

export async function importEtsyCsv(workspaceId: string, ordersCsv: string, itemsCsv: string) {
  assertCsvSize(ordersCsv, "Orders CSV");
  assertCsvSize(itemsCsv, "Order Items CSV");
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
  const existingProducts = new Set((await db.product.findMany({ where: { workspaceId }, select: { name: true } })).map((product) => product.name));
  let imported = 0;
  for (const [externalId, group] of Array.from(orders.entries())) {
    const data = orderData(group.row);
    await db.$transaction(async (tx) => {
      const order = await tx.order.upsert({ where: { workspaceId_externalId: { workspaceId, externalId } }, update: data, create: { workspaceId, externalId, ...data } });
      await tx.orderItem.deleteMany({ where: { orderId: order.id, workspaceId } });
      if (group.items.length) {
        await tx.orderItem.createMany({ data: group.items.map((row) => ({ workspaceId, orderId: order.id, externalOrderId: externalId, itemName: value(row, "Item Name") || "Untitled item", buyer: value(row, "Buyer"), quantity: number(row, "Quantity") || 1, price: number(row, "Price"), itemTotal: number(row, "Item Total"), currency: value(row, "Currency") || "USD", transactionId: value(row, "Transaction ID") || null, sku: value(row, "SKU"), variations: value(row, "Variations") })) });
      }
      const newProducts = group.items.map((row) => ({ name: value(row, "Item Name") || "Untitled item", sku: value(row, "SKU") })).filter((product) => !existingProducts.has(product.name));
      for (const product of newProducts) {
        if (existingProducts.has(product.name)) continue;
        existingProducts.add(product.name);
        await tx.product.create({ data: { workspaceId, name: product.name, sku: product.sku } });
      }
    });
    imported++;
  }
  return { orders: imported, items: itemRows.length };
}

const FORMULA_PREFIX = /^[=+\-@\t\r]/;
export function csvCell(input: string | number) {
  let text = String(input);
  if (FORMULA_PREFIX.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(rows: (string | number)[][]) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
