import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      // Supabase transaction pooler (port 6543) handles connection multiplexing — a small per-instance pool lets layout + page queries run in parallel.
      max: 5,
    }),
  });

globalForPrisma.prisma = prisma;
