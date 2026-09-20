import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { tmDb?: PrismaClient };
export const db = globalForPrisma.tmDb ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.tmDb = db;
