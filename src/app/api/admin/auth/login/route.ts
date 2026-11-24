import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { hashClientIp, verifyPassword } from "@/lib/security/password";
import {
  createAdminSession,
  buildSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/security/session";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { readJsonBody, RequestBodyError } from "@/lib/security/request-body";

const LoginSchema = z.object({
  email: z.string().trim().email("সঠিক ইমেইল প্রদান করুন"),
  password: z.string().min(8, "পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে"),
});

// Strict rate limiter: 5 attempts per 15 minutes
const loginLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  namespace: "bcp:admin-login",
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  let rateCheck;
  try {
    rateCheck = await loginLimiter.check(hashClientIp(ip));
  } catch {
    return NextResponse.json(
      { success: false, error: "নিরাপত্তা যাচাই সাময়িকভাবে অনুপলভ্য।" },
      { status: 503 },
    );
  }
  if (!rateCheck.allowed) {
    const retryAfter = Math.ceil((rateCheck.resetAtMs - Date.now()) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: "অতিরিক্ত চেষ্টা করা হয়েছে। কিছুক্ষণ পর পুনরায় চেষ্টা করুন।",
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "ডাটাবেজ কনফিগার করা নেই। অনুগ্রহ করে DATABASE_URL সেট করে পুনরায় চেষ্টা করুন।",
      },
      { status: 503 },
    );
  }

  try {
    const json = await readJsonBody(request, 8 * 1024);
    const result = LoginSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "ভুল ইনপুট ফরম্যাট।",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "ভুল ইমেইল অথবা পাসওয়ার্ড।" },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "ভুল ইমেইল অথবা পাসওয়ার্ড।" },
        { status: 401 },
      );
    }

    const { rawToken, expiresAt } = await createAdminSession(user.id, {
      userAgent: request.headers.get("user-agent"),
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "AUTH_LOGIN_SUCCESS",
        entityType: "AdminUser",
        entityId: user.id,
        summary: `Staff login successful: ${user.email}`,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      rawToken,
      buildSessionCookieOptions(expiresAt),
    );

    return response;
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json(
        { success: false, error: "অবৈধ বা অতিরিক্ত বড় রিকোয়েস্ট।" },
        { status: error.code === "BODY_TOO_LARGE" ? 413 : 400 },
      );
    }
    console.error("[Admin Login Error]", error);
    return NextResponse.json(
      { success: false, error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।" },
      { status: 500 },
    );
  }
}
