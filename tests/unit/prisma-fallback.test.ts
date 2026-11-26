import { afterEach, describe, expect, it, vi } from "vitest";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
  delete (globalThis as { bcpDbSchemaCache?: unknown }).bcpDbSchemaCache;
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("Prisma configuration and schema readiness fallback", () => {
  it("detects unconfigured, placeholder, and valid DATABASE_URL values", async () => {
    const { isDatabaseConfigured } = await import("@/lib/db/prisma");

    delete process.env.DATABASE_URL;
    expect(isDatabaseConfigured()).toBe(false);

    process.env.DATABASE_URL = "   ";
    expect(isDatabaseConfigured()).toBe(false);

    process.env.DATABASE_URL =
      "postgresql://USER:PASSWORD@HOST:5432/bcp?schema=public";
    expect(isDatabaseConfigured()).toBe(false);

    process.env.DATABASE_URL =
      "postgresql://postgres:secret@localhost:5432/bcp?schema=public";
    expect(isDatabaseConfigured()).toBe(true);
  });

  it("returns unconfigured health status without throwing when DATABASE_URL is absent", async () => {
    delete process.env.DATABASE_URL;
    const { checkDatabaseHealth } = await import("@/lib/db/prisma");

    const health = await checkDatabaseHealth();
    expect(health).toEqual({
      connected: false,
      status: "unconfigured",
    });
  });

  it("returns false from isPublicSchemaReady when DATABASE_URL is absent", async () => {
    delete process.env.DATABASE_URL;
    const { isPublicSchemaReady } = await import("@/lib/db/schema-ready");

    await expect(isPublicSchemaReady()).resolves.toBe(false);
  });

  it("handles missing tables or rejected $queryRaw cleanly without throwing", async () => {
    process.env.DATABASE_URL =
      "postgresql://postgres:secret@localhost:5432/bcp?schema=public";

    vi.doMock("@/lib/db/prisma", () => ({
      isDatabaseConfigured: () => true,
      prisma: {
        $queryRaw: vi
          .fn()
          .mockRejectedValueOnce(new Error('P2021: table "public.courses" does not exist')),
      },
    }));

    const { isPublicSchemaReady } = await import("@/lib/db/schema-ready");
    await expect(isPublicSchemaReady()).resolves.toBe(false);
  });

  it("returns true when both courses and site_settings regclasses exist and caches result", async () => {
    process.env.DATABASE_URL =
      "postgresql://postgres:secret@localhost:5432/bcp?schema=public";

    const queryRaw = vi.fn().mockResolvedValue([
      {
        courses_tbl: "courses",
        settings_tbl: "site_settings",
      },
    ]);

    vi.doMock("@/lib/db/prisma", () => ({
      isDatabaseConfigured: () => true,
      prisma: {
        $queryRaw: queryRaw,
      },
    }));

    const { isPublicSchemaReady } = await import("@/lib/db/schema-ready");
    await expect(isPublicSchemaReady()).resolves.toBe(true);
    await expect(isPublicSchemaReady()).resolves.toBe(true);
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
