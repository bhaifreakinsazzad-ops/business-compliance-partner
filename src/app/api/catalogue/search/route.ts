import { NextResponse, type NextRequest } from "next/server";
import { searchPublishedCatalogue } from "@/lib/services/catalogue";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchPublishedCatalogue(q);

  return NextResponse.json({
    ok: true,
    data: results,
  });
}
