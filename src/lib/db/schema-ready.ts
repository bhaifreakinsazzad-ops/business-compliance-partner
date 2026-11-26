import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const SCHEMA_CACHE_TTL_MS = 30_000;

const globalForSchema = globalThis as unknown as {
  bcpDbSchemaCache?: {
    checkedAt: number;
    ready: boolean;
  };
  bcpCoreSchemaCache?: {
    checkedAt: number;
    ready: boolean;
  };
  bcpBooksSchemaCache?: {
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

/**
 * Checks whether customer commerce, LMS, and private document tables are migrated.
 * Financial, enrollment, and document routes must fail closed (503) if false.
 */
export async function isCoreCommerceSchemaReady(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const cached = globalForSchema.bcpCoreSchemaCache;
  if (cached && Date.now() - cached.checkedAt < SCHEMA_CACHE_TTL_MS) {
    return cached.ready;
  }

  if (typeof prisma.$queryRaw !== "function") {
    return true;
  }

  try {
    const rows = await prisma.$queryRaw<
      {
        orders_tbl: string | null;
        quotes_tbl: string | null;
        enrollments_tbl: string | null;
        documents_tbl: string | null;
      }[]
    >`
      SELECT
        to_regclass('public.orders')::text AS orders_tbl,
        to_regclass('public.quotes')::text AS quotes_tbl,
        to_regclass('public.enrollments')::text AS enrollments_tbl,
        to_regclass('public.documents')::text AS documents_tbl
    `;
    const first = rows?.[0];
    const ready = Boolean(
      first?.orders_tbl &&
        first?.quotes_tbl &&
        first?.enrollments_tbl &&
        first?.documents_tbl,
    );
    globalForSchema.bcpCoreSchemaCache = {
      checkedAt: Date.now(),
      ready,
    };
    return ready;
  } catch {
    globalForSchema.bcpCoreSchemaCache = {
      checkedAt: Date.now(),
      ready: false,
    };
    return false;
  }
}

/**
 * Checks whether bookstore tables exist in PostgreSQL (cached for 30s).
 */
export async function isBooksSchemaReady(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const cached = globalForSchema.bcpBooksSchemaCache;
  if (cached && Date.now() - cached.checkedAt < SCHEMA_CACHE_TTL_MS) {
    return cached.ready;
  }

  if (typeof prisma.$queryRaw !== "function") {
    return true;
  }

  try {
    const rows = await prisma.$queryRaw<
      { books_tbl: string | null; book_categories_tbl: string | null }[]
    >`
      SELECT
        to_regclass('public.books')::text AS books_tbl,
        to_regclass('public.book_categories')::text AS book_categories_tbl
    `;
    const first = rows?.[0];
    const ready = Boolean(first?.books_tbl && first?.book_categories_tbl);
    globalForSchema.bcpBooksSchemaCache = {
      checkedAt: Date.now(),
      ready,
    };
    return ready;
  } catch {
    globalForSchema.bcpBooksSchemaCache = {
      checkedAt: Date.now(),
      ready: false,
    };
    return false;
  }
}
