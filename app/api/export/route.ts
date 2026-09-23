import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { getWorkspaceContext } from "@/lib/auth";
import { buildExport, EXPORT_TYPES, type ExportType } from "@/lib/exports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = await getWorkspaceContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!context.user.emailVerifiedAt) return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  const type = new URL(request.url).searchParams.get("type") ?? "";
  if (!EXPORT_TYPES.includes(type as ExportType)) return NextResponse.json({ error: "Unknown export" }, { status: 400 });
  const { filename, csv } = await buildExport(type as ExportType);
  await audit("export.downloaded", { userId: context.user.id, workspaceId: context.workspace.id, metadata: { type } });
  return new NextResponse(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
