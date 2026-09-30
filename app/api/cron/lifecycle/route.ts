import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runLifecycle } from "@/lib/lifecycle";
import { safeEqual } from "@/lib/security";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!env.CRON_SECRET || !safeEqual(header, `Bearer ${env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runLifecycle();
  return NextResponse.json({ scanned: result.scanned, sent: result.sent.length });
}
