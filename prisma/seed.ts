import fs from "node:fs";
import path from "node:path";
import { hash } from "@node-rs/argon2";
import { PrismaClient } from "@prisma/client";
import { applyDemoCosts, importEtsyCsv } from "../lib/csv";

const db = new PrismaClient();
const SEED_EMAIL = process.env.SEED_EMAIL ?? "demo@truemargin.local";
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "demo-passphrase-123";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "1") throw new Error("Refusing to seed a production database. Set ALLOW_PROD_SEED=1 to override.");
  await db.user.deleteMany({ where: { email: SEED_EMAIL } });
  const workspace = await db.workspace.create({ data: { name: "Demo Etsy shop", trialEndsAt: new Date(Date.now() + 30 * 86_400_000), settings: { create: {} } } });
  await db.user.create({ data: { email: SEED_EMAIL, passwordHash: await hash(SEED_PASSWORD, { memoryCost: 19456, timeCost: 2, parallelism: 1 }), emailVerifiedAt: new Date(), memberships: { create: { workspaceId: workspace.id, role: "OWNER" } } } });
  const orders = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrders_demo.csv"), "utf8");
  const items = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrderItems_demo.csv"), "utf8");
  await importEtsyCsv(workspace.id, orders, items);
  await applyDemoCosts(workspace.id);
  const products = await db.product.count({ where: { workspaceId: workspace.id } });
  console.log(`Seeded demo user ${SEED_EMAIL} with 200 orders and ${products} products. Log in with the SEED_PASSWORD you set (default shown in .env.example).`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => db.$disconnect());
