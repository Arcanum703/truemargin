import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { tmDb?: PrismaClient };
export const db = globalForPrisma.tmDb ?? new PrismaClient({ log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.tmDb = db;
