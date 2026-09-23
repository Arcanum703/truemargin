import crypto from "node:crypto";
import { headers } from "next/headers";
import { env } from "@/lib/env";

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(token).digest("hex");
}

export function hashIp(ip: string) {
  return ip ? crypto.createHmac("sha256", env.SESSION_SECRET).update(`ip:${ip}`).digest("hex").slice(0, 32) : "";
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function requestContext() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? "";
  const ip = (h.get("x-real-ip") ?? forwarded.split(",")[0] ?? "").trim();
  return { ip, ipHash: hashIp(ip), userAgent: (h.get("user-agent") ?? "").slice(0, 200) };
}

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

export function toUserMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  return error instanceof UserFacingError ? error.message : fallback;
}
