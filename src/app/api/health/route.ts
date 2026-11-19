import { NextResponse } from "next/server";
import { isStagingEnvironment } from "@/lib/config/site";
import { checkDatabaseHealth } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const statusCode = dbHealth.status === "error" ? 503 : 200;

  return NextResponse.json(
    {
      ok: dbHealth.status !== "error",
      status: dbHealth.status === "connected" ? "healthy" : dbHealth.status,
      environment: isStagingEnvironment() ? "staging" : "production",
      database: dbHealth.status,
      ...(typeof dbHealth.latencyMs === "number"
        ? { latencyMs: dbHealth.latencyMs }
        : {}),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}
