import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function getWorkspace() {
  const token = cookies().get("tm_workspace")?.value;
  if (token) {
    const existing = await db.workspace.findUnique({ where: { token }, include: { settings: true } });
    if (existing) return existing;
  }
  const existing = await db.workspace.findFirst({ orderBy: { createdAt: "asc" }, include: { settings: true } });
  if (existing) return existing;
  return db.workspace.create({ data: { token: crypto.randomBytes(18).toString("hex"), settings: { create: {} } }, include: { settings: true } });
}
