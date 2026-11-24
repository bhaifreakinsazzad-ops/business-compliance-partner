import { NextResponse, type NextRequest } from "next/server";
import { submitPublicLead } from "@/lib/services/leads";
import { readJsonBody, RequestBodyError } from "@/lib/security/request-body";

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await readJsonBody(request, 32 * 1024);
  } catch (error) {
    const tooLarge =
      error instanceof RequestBodyError && error.code === "BODY_TOO_LARGE";
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: tooLarge ? "BODY_TOO_LARGE" : "INVALID_JSON",
          messageBn: tooLarge
            ? "অনুরোধের তথ্য অনুমোদিত সীমার চেয়ে বড়।"
            : "অনুরোধের তথ্য সঠিকভাবে পড়া যায়নি।",
          messageEn: tooLarge
            ? "Request body exceeds the allowed size."
            : "Invalid JSON request body.",
        },
      },
      { status: tooLarge ? 413 : 400 },
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
