import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { importEtsyCsv } from "../lib/csv";

const db = new PrismaClient();

async function main() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.settings.deleteMany();
  await db.workspace.deleteMany();
  const workspace = await db.workspace.create({ data: { token: crypto.randomBytes(18).toString("hex"), settings: { create: {} } } });
  const orders = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrders_demo.csv"), "utf8");
  const items = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrderItems_demo.csv"), "utf8");
  await importEtsyCsv(workspace.id, orders, items);
  const products = await db.product.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: "asc" } });
  for (const [index, product] of Array.from(products.entries())) {
    await db.product.update({ where: { id: product.id }, data: { materialCost: [4, 12, 3, 7, 1, 2, 15, 4, 8, 2, 5, 9, 0, 14, 20][index] ?? 5, laborMinutes: 8 + (index % 5) * 7, packagingCost: 1.25, stockOnHand: index % 4 === 0 ? 3 : 18 + index, reorderPoint: 8 } });
  }
  console.log(`Seeded TrueMargin demo workspace ${workspace.token} with 200 orders and ${products.length} products.`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => db.$disconnect());
