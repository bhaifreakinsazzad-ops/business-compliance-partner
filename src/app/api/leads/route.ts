import { NextResponse, type NextRequest } from "next/server";
import { submitPublicLead } from "@/lib/services/leads";

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_JSON",
          messageBn: "অনুরোধের তথ্য সঠিকভাবে পড়া যায়নি।",
          messageEn: "Invalid JSON request body.",
        },
      },
      { status: 400 },
    );
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwarded?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  const result = await submitPublicLead(rawBody, { ipAddress });
  return NextResponse.json(result.body, { status: result.status });
}
