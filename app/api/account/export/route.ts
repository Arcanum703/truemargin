import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { getWorkspaceContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getWorkspaceContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, workspace } = context;
  try {
    await consumeRateLimit("account", user.id);
  } catch {
    return NextResponse.json({ error: "Too many export requests. Try again later." }, { status: 429 });
  }
  const [products, orders, orderItems, auditLogs] = await Promise.all([
    db.product.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: "asc" } }),
    db.order.findMany({ where: { workspaceId: workspace.id }, orderBy: { saleDate: "asc" } }),
    db.orderItem.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "asc" } }),
    db.auditLog.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" }, take: 500, select: { createdAt: true, action: true, metadata: true } }),
  ]);
  await audit("account.exported", { userId: user.id, workspaceId: workspace.id });
  const payload = {
    exportedAt: new Date().toISOString(),
    user: { email: user.email, createdAt: user.createdAt, emailVerifiedAt: user.emailVerifiedAt },
    workspace: { name: workspace.name, createdAt: workspace.createdAt, subscriptionStatus: workspace.subscriptionStatus, trialEndsAt: workspace.trialEndsAt, settings: workspace.settings },
    products,
    orders,
    orderItems,
    auditLogs,
  };
  return new NextResponse(JSON.stringify(payload, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="truemargin-account-export.json"`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
