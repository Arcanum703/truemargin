import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requestContext } from "@/lib/security";

export async function audit(action: string, options: { userId?: string | null; workspaceId?: string | null; metadata?: Prisma.InputJsonValue } = {}) {
  const { ipHash } = await requestContext();
  await db.auditLog.create({ data: { action, userId: options.userId ?? null, workspaceId: options.workspaceId ?? null, ipHash, metadata: options.metadata } });
}
