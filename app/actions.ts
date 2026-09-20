"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { importEtsyCsv } from "@/lib/csv";
import { getWorkspace } from "@/lib/workspace";

async function importFiles(workspaceId: string, ordersCsv: string, itemsCsv: string) {
  const result = await importEtsyCsv(workspaceId, ordersCsv, itemsCsv);
  revalidatePath("/");
  revalidatePath("/import");
  revalidatePath("/products");
  revalidatePath("/alerts");
  return result;
}

export async function loadDemoShopAction() {
  const workspace = await getWorkspace();
  const ordersCsv = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrders_demo.csv"), "utf8");
  const itemsCsv = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrderItems_demo.csv"), "utf8");
  await importFiles(workspace.id, ordersCsv, itemsCsv);
}

export async function importCsvAction(formData: FormData) {
  const workspace = await getWorkspace();
  const ordersCsv = String(formData.get("ordersCsv") || "");
  const itemsCsv = String(formData.get("itemsCsv") || "");
  if (!ordersCsv.trim() || !itemsCsv.trim()) throw new Error("Both Etsy CSVs are required.");
  await importFiles(workspace.id, ordersCsv, itemsCsv);
}

export async function saveProductAction(formData: FormData) {
  const workspace = await getWorkspace();
  const id = String(formData.get("id") || "");
  const data = { name: String(formData.get("name")), sku: String(formData.get("sku") || ""), materialCost: Number(formData.get("materialCost")) || 0, laborMinutes: Number(formData.get("laborMinutes")) || 0, packagingCost: Number(formData.get("packagingCost")) || 0, stockOnHand: Number(formData.get("stockOnHand")) || 0, reorderPoint: Number(formData.get("reorderPoint")) || 0 };
  if (id) await db.product.update({ where: { id }, data });
  else await db.product.create({ data: { ...data, workspaceId: workspace.id } });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/alerts");
}

export async function toggleOffsiteAction(formData: FormData) {
  const id = String(formData.get("orderId"));
  const workspace = await getWorkspace();
  await db.order.findFirstOrThrow({ where: { id, workspaceId: workspace.id } });
  await db.order.update({ where: { id }, data: { offsiteAdsAttributed: formData.get("offsiteAds") === "on" } });
  revalidatePath("/");
}

export async function saveSettingsAction(formData: FormData) {
  const workspace = await getWorkspace();
  await db.settings.upsert({ where: { workspaceId: workspace.id }, update: { hourlyRate: Number(formData.get("hourlyRate")) || 0, listingFee: Number(formData.get("listingFee")) || 0.2, transactionRate: Number(formData.get("transactionRate")) || 6.5, paymentRate: Number(formData.get("paymentRate")) || 3, paymentFixed: Number(formData.get("paymentFixed")) || 0.25, offsiteAdsEnabled: formData.get("offsiteAdsEnabled") === "on", offsiteAdsRate: Number(formData.get("offsiteAdsRate")) || 15, estimatedOffsitePercent: Number(formData.get("estimatedOffsitePercent")) || 0, defaultShippingCost: Number(formData.get("defaultShippingCost")) || 0, marginThreshold: Number(formData.get("marginThreshold")) || 30, targetMargin: Number(formData.get("targetMargin")) || 40 }, create: { workspaceId: workspace.id } });
  revalidatePath("/");
  revalidatePath("/settings");
}
