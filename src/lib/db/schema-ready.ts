import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const SCHEMA_CACHE_TTL_MS = 30_000;

const globalForSchema = globalThis as unknown as {
  bcpDbSchemaCache?: {
    checkedAt: number;
    ready: boolean;
  };
};

/**
 * Checks whether DATABASE_URL is configured AND core public catalogue tables
 * exist in PostgreSQL (cached for 30s). Prevents repeated failing queries when
 * running against a freshly provisioned or unmigrated database.
 */
export async function isPublicSchemaReady(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const cached = globalForSchema.bcpDbSchemaCache;
  if (cached && Date.now() - cached.checkedAt < SCHEMA_CACHE_TTL_MS) {
    return cached.ready;
  }

  if (typeof prisma.$queryRaw !== "function") {
    return true;
  }

  try {
    const rows = await prisma.$queryRaw<
      { courses_tbl: string | null; settings_tbl: string | null }[]
    >`
      SELECT
        to_regclass('public.courses')::text AS courses_tbl,
        to_regclass('public.site_settings')::text AS settings_tbl
    `;
    const first = rows?.[0];
    const ready = Boolean(first?.courses_tbl && first?.settings_tbl);
    globalForSchema.bcpDbSchemaCache = {
      checkedAt: Date.now(),
      ready,
    };
    return ready;
  } catch {
    globalForSchema.bcpDbSchemaCache = {
      checkedAt: Date.now(),
      ready: false,
    };
    return false;
  }
}
