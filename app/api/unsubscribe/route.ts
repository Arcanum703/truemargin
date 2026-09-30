import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unsubscribeToken } from "@/lib/lifecycle";
import { safeEqual } from "@/lib/security";

export const dynamic = "force-dynamic";

async function optOut(request: Request) {
  const params = new URL(request.url).searchParams;
  const userId = params.get("u") ?? "";
  const token = params.get("t") ?? "";
  if (!userId || userId.length > 64 || !token || !safeEqual(token, unsubscribeToken(userId))) {
    return new NextResponse("Invalid unsubscribe link.", { status: 400 });
  }
  await db.user.updateMany({ where: { id: userId }, data: { marketingOptOut: true } });
  return new NextResponse("You will no longer receive onboarding emails from TrueMargin. Security and account emails (password resets, verification) are unaffected.", { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export const GET = optOut;
export const POST = optOut;
