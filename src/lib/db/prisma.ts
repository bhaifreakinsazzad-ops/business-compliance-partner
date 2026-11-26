import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url && url.length > 0 && !url.includes("USER:PASSWORD@HOST"));
}

function createPrismaClient(): PrismaClient {
  try {
    return new PrismaClient({
      // Deliberately omit "query" logging so PII parameters never enter server stdout.
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  } catch {
    console.warn("[AI Studio] Database not connected — using mock");
    const noOp = {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      count: async () => 0,
      create: async (d: { data?: unknown }) => d?.data ?? {},
      update: async (d: { data?: unknown }) => d?.data ?? {},
      delete: async () => ({}),
    };
    return new Proxy({}, { get: () => noOp }) as unknown as PrismaClient;
  }
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface DatabaseHealthResult {
  connected: boolean;
  status: "connected" | "unconfigured" | "error";
  latencyMs?: number;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  if (!isDatabaseConfigured()) {
    return { connected: false, status: "unconfigured" };
  }

  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      status: "connected",
      latencyMs: Date.now() - startedAt,
    };
  } catch {
    return { connected: false, status: "error" };
  }
}
