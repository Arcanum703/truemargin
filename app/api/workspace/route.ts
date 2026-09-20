import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const response = NextResponse.json({ ok: true });
  const requestedToken = new URL(request.url).searchParams.get("token");
  const cookieToken = request.headers.get("cookie")?.match(/(?:^|;\s*)tm_workspace=([^;]+)/)?.[1];
  const token = requestedToken || cookieToken;
  if (token && await db.workspace.findUnique({ where: { token } })) {
    response.cookies.set("tm_workspace", token, { httpOnly: true, sameSite: "lax", path: "/" });
    return response;
  }
  const workspace = await db.workspace.findFirst({ orderBy: { createdAt: "asc" } }) ?? await db.workspace.create({ data: { token: crypto.randomBytes(18).toString("hex"), settings: { create: {} } } });
  response.cookies.set("tm_workspace", workspace.token, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
