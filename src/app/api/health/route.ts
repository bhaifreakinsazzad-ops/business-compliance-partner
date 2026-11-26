import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isStagingEnvironment } from "@/lib/config/site";
import { checkDatabaseHealth } from "@/lib/db/prisma";
import { isPublicSchemaReady, isCoreCommerceSchemaReady, isBooksSchemaReady } from "@/lib/db/schema-ready";
import { getCurrentAdminSession } from "@/lib/security/session";
import { assertDurablePrivateStorageConfigured } from "@/lib/storage/private-documents";

export const dynamic = "force-dynamic";

function hasValidHealthToken(request: NextRequest): boolean {
  const configuredToken = process.env.HEALTHCHECK_TOKEN?.trim();
  if (!configuredToken) return false;

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const headerToken =
    bearer || request.headers.get("x-healthcheck-token")?.trim() || "";

  if (!headerToken) return false;
  const a = Buffer.from(configuredToken);
  const b = Buffer.from(headerToken);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const dbHealth = await checkDatabaseHealth();
  const [publicSchema, commerceSchema, booksSchema] = dbHealth.status === "connected"
    ? await Promise.all([isPublicSchemaReady(), isCoreCommerceSchemaReady(), isBooksSchemaReady()])
    : [false, false, false];
  const isHealthy = dbHealth.status === "connected" && publicSchema && commerceSchema && booksSchema;
  const statusCode = isHealthy ? 200 : 503;

  const [admin, tokenAuthorized] = await Promise.all([
    getCurrentAdminSession().catch(() => null),
    Promise.resolve(hasValidHealthToken(request)),
  ]);

  const includeDiagnostics = Boolean(admin?.role === "ADMIN" || tokenAuthorized);

  if (!includeDiagnostics) {
    return NextResponse.json(
      {
        ok: isHealthy,
        status: isHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    );
  }

  let storageDiag: { configured: boolean; provider: string; error?: string };
  try {
    const resolved = assertDurablePrivateStorageConfigured();
    storageDiag = { configured: true, provider: resolved.provider };
  } catch (err) {
    storageDiag = {
      configured: false,
      provider: process.env.PRIVATE_STORAGE_PROVIDER?.trim() || "LOCAL",
      error: err instanceof Error ? err.message : "STORAGE_NOT_CONFIGURED",
    };
  }

  return NextResponse.json(
    {
      ok: isHealthy,
      status: isHealthy ? "healthy" : "degraded",
      schemaReadiness: { public: publicSchema, commerce: commerceSchema, books: booksSchema },
      environment: isStagingEnvironment() ? "staging" : "production",
      database: dbHealth.status,
      ...(typeof dbHealth.latencyMs === "number"
        ? { latencyMs: dbHealth.latencyMs }
        : {}),
      privateStorage: storageDiag,
      sandboxPaymentsEnabled:
        process.env.SANDBOX_PAYMENTS_ENABLED === "true" &&
        process.env.NODE_ENV !== "production",
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}
